import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ReservationStatus, TipoNotificacion } from '../../../generated/prisma/client';
import { errorResponse } from '../../common/errors/error-response';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

const ACTIVE_RESERVATION_STATUSES = [
  ReservationStatus.CONFIRMADA,
  ReservationStatus.EN_PROGRESO,
] as const;

const reservationInclude = {
  pet: {
    select: {
      id: true,
      nombre: true,
      userId: true,
      isActive: true,
    },
  },
  room: {
    select: {
      id: true,
      numero: true,
    },
  },
} satisfies Prisma.ReservationInclude;

type ReservationWithRelations = Prisma.ReservationGetPayload<{
  include: typeof reservationInclude;
}>;

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateReservationDto) {
    const fechaEntrada = this.parseDateOnly(dto.fechaEntrada, 'fechaEntrada');
    const fechaSalida = this.parseDateOnly(dto.fechaSalida, 'fechaSalida');
    this.assertDateRange(fechaEntrada, fechaSalida);

    const pet = await this.assertPetOwnership(dto.mascotaId, userId);
    await this.assertRoomExists(dto.habitacionId);
    this.assertAdditionalServices(dto.tipoHospedaje, dto.serviciosAdicionales ?? []);
    await this.assertPetAvailability(pet.id, fechaEntrada, fechaSalida);
    await this.assertRoomAvailability(dto.habitacionId, fechaEntrada, fechaSalida);

    // Create without include to avoid Neon HTTP adapter transaction limitation
    await this.prisma.reservation.create({
      data: {
        userId,
        mascotaId: pet.id,
        habitacionId: dto.habitacionId,
        fechaEntrada,
        fechaSalida,
        esEspecial: dto.tipoHospedaje === 'especial',
        serviciosAdicionales: this.serializeAdditionalServices(dto.serviciosAdicionales ?? []),
        estado: ReservationStatus.CONFIRMADA,
      },
    });

    // Fetch with relations separately
    const reservation = await this.prisma.reservation.findFirst({
      where: {
        userId,
        mascotaId: pet.id,
        habitacionId: dto.habitacionId,
        fechaEntrada,
        fechaSalida,
      },
      include: reservationInclude,
    });

    if (!reservation) {
      throw new InternalServerErrorException(
        errorResponse(
          'RESERVATION_CREATE_FAILED',
          'No se pudo recuperar la reserva creada',
        ),
      );
    }

    await this.notificationsService.sendByType(
      TipoNotificacion.CONFIRMACION_RESERVA,
      userId,
      this.buildNotificationVariables(reservation),
      reservation.id,
    );

    return this.toResponse(reservation);
  }

  getStatuses(): ReservationStatus[] {
    return Object.values(ReservationStatus);
  }

  async findAll(userId: string, estado?: ReservationStatus) {
    const reservations = await this.prisma.reservation.findMany({
      where: {
        userId,
        ...(estado ? { estado } : {}),
      },
      include: reservationInclude,
      orderBy: [{ fechaEntrada: 'desc' }, { fechaCreacion: 'desc' }],
    });

    return reservations.map((reservation) => this.toResponse(reservation));
  }

  async findOne(id: string, userId: string) {
    const reservation = await this.assertReservationOwnership(id, userId);
    return this.toResponse(reservation);
  }

  async update(id: string, userId: string, dto: UpdateReservationDto) {
    const reservation = await this.assertReservationOwnership(id, userId);

    if (reservation.estado !== ReservationStatus.CONFIRMADA) {
      throw new BadRequestException(
        errorResponse(
          'RESERVATION_NOT_MODIFIABLE',
          'Solo se pueden modificar reservas en estado confirmada',
        ),
      );
    }

    if (
      dto.fechaEntrada === undefined &&
      dto.fechaSalida === undefined &&
      dto.serviciosAdicionales === undefined
    ) {
      return this.toResponse(reservation);
    }

    const fechaEntrada = dto.fechaEntrada
      ? this.parseDateOnly(dto.fechaEntrada, 'fechaEntrada')
      : reservation.fechaEntrada;
    const fechaSalida = dto.fechaSalida
      ? this.parseDateOnly(dto.fechaSalida, 'fechaSalida')
      : reservation.fechaSalida;
    this.assertDateRange(fechaEntrada, fechaSalida);

    const currentAdditionalServices = this.parseAdditionalServices(
      reservation.serviciosAdicionales,
    );
    const serviciosAdicionales = dto.serviciosAdicionales ?? currentAdditionalServices;
    this.assertAdditionalServices(
      reservation.esEspecial ? 'especial' : 'estandar',
      serviciosAdicionales,
    );
    await this.assertPetAvailability(reservation.mascotaId, fechaEntrada, fechaSalida, reservation.id);
    await this.assertRoomAvailability(
      reservation.habitacionId,
      fechaEntrada,
      fechaSalida,
      reservation.id,
    );

    // Update without include to avoid Neon HTTP adapter transaction limitation
    await this.prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        fechaEntrada,
        fechaSalida,
        serviciosAdicionales: this.serializeAdditionalServices(serviciosAdicionales),
      },
    });

    // Fetch with relations separately
    const updatedReservation = await this.prisma.reservation.findUnique({
      where: { id: reservation.id },
      include: reservationInclude,
    });

    if (!updatedReservation) {
      throw new InternalServerErrorException(
        errorResponse(
          'RESERVATION_UPDATE_FAILED',
          'No se pudo recuperar la reserva actualizada',
        ),
      );
    }

    await this.notificationsService.sendByType(
      TipoNotificacion.MODIFICACION_RESERVA,
      userId,
      this.buildNotificationVariables(updatedReservation),
      updatedReservation.id,
    );

    return this.toResponse(updatedReservation);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.assertReservationOwnership(id, userId);
    await this.prisma.reservation.update({
      where: { id },
      data: { estado: ReservationStatus.CANCELADA },
    });
  }

  private async assertPetOwnership(mascotaId: string, userId: string) {
    const pet = await this.prisma.pet.findUnique({
      where: { id: mascotaId },
      select: {
        id: true,
        nombre: true,
        userId: true,
        isActive: true,
      },
    });

    if (!pet || !pet.isActive) {
      throw new NotFoundException(errorResponse('PET_NOT_FOUND', 'Mascota no encontrada'));
    }

    if (pet.userId !== userId) {
      throw new ForbiddenException(
        errorResponse('PET_NOT_OWNER', 'La mascota no pertenece al usuario autenticado'),
      );
    }

    return pet;
  }

  private async assertRoomExists(habitacionId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: habitacionId },
      select: {
        id: true,
      },
    });

    if (!room) {
      throw new NotFoundException(
        errorResponse('ROOM_NOT_FOUND', 'Habitacion no encontrada'),
      );
    }
  }

  private async assertReservationOwnership(
    id: string,
    userId: string,
  ): Promise<ReservationWithRelations> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: reservationInclude,
    });

    if (!reservation) {
      throw new NotFoundException(
        errorResponse('RESERVATION_NOT_FOUND', 'Reserva no encontrada'),
      );
    }

    if (reservation.userId !== userId) {
      throw new ForbiddenException(
        errorResponse('RESERVATION_NOT_OWNER', 'La reserva no pertenece al usuario autenticado'),
      );
    }

    return reservation;
  }

  private async assertRoomAvailability(
    habitacionId: string,
    fechaEntrada: Date,
    fechaSalida: Date,
    excludeReservationId?: string,
  ): Promise<void> {
    const overlappingReservation = await this.prisma.reservation.findFirst({
      where: {
        habitacionId,
        estado: { in: [...ACTIVE_RESERVATION_STATUSES] },
        fechaEntrada: { lte: fechaSalida },
        fechaSalida: { gte: fechaEntrada },
        ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
      },
      select: {
        id: true,
      },
    });

    if (overlappingReservation) {
      throw new ConflictException(
        errorResponse(
          'ROOM_NOT_AVAILABLE',
          'La habitacion ya tiene una reserva activa en el rango de fechas solicitado',
        ),
      );
    }
  }

  private async assertPetAvailability(
    mascotaId: string,
    fechaEntrada: Date,
    fechaSalida: Date,
    excludeReservationId?: string,
  ): Promise<void> {
    const overlappingReservation = await this.prisma.reservation.findFirst({
      where: {
        mascotaId,
        estado: { in: [...ACTIVE_RESERVATION_STATUSES] },
        fechaEntrada: { lte: fechaSalida },
        fechaSalida: { gte: fechaEntrada },
        ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
      },
      select: { id: true },
    });

    if (overlappingReservation) {
      throw new ConflictException(
        errorResponse(
          'PET_ALREADY_RESERVED',
          'La mascota ya tiene una reserva activa en el rango de fechas solicitado',
        ),
      );
    }
  }

  private assertDateRange(fechaEntrada: Date, fechaSalida: Date): void {
    if (fechaEntrada >= fechaSalida) {
      throw new BadRequestException(
        errorResponse(
          'INVALID_DATE_RANGE',
          'La fechaEntrada debe ser anterior a la fechaSalida',
        ),
      );
    }
  }

  private assertAdditionalServices(tipoHospedaje: string, serviciosAdicionales: string[]): void {
    if (tipoHospedaje === 'estandar' && serviciosAdicionales.length > 0) {
      throw new BadRequestException(
        errorResponse(
          'SERVICES_NOT_ALLOWED',
          'Los servicios adicionales solo se permiten para reservas de tipo especial',
        ),
      );
    }
  }

  private parseDateOnly(value: string, fieldName: 'fechaEntrada' | 'fechaSalida'): Date {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new BadRequestException(
        errorResponse('INVALID_DATE', `La fecha ${fieldName} no es valida`),
      );
    }

    const [yearText, monthText, dayText] = value.split('-');
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      Number.isNaN(date.getTime()) ||
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      throw new BadRequestException(
        errorResponse('INVALID_DATE', `La fecha ${fieldName} no es valida`),
      );
    }

    return date;
  }

  private buildNotificationVariables(reservation: ReservationWithRelations) {
    return {
      petName: reservation.pet.nombre,
      checkInDate: this.formatDateForNotification(reservation.fechaEntrada),
      checkOutDate: this.formatDateForNotification(reservation.fechaSalida),
      roomNumber: reservation.room.numero,
    };
  }

  private formatDateForNotification(date: Date): string {
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }

  private formatDateForResponse(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private parseAdditionalServices(value: string | null): string[] {
    if (!value) {
      return [];
    }

    return value
      .split(',')
      .map((service) => service.trim())
      .filter((service) => service.length > 0);
  }

  private serializeAdditionalServices(services: string[]): string | null {
    if (services.length === 0) {
      return null;
    }

    return services.join(',');
  }

  private toResponse(reservation: ReservationWithRelations) {
    return {
      id: reservation.id,
      mascotaId: reservation.mascotaId,
      habitacionId: reservation.habitacionId,
      nombreMascota: reservation.pet.nombre,
      habitacion: reservation.room.numero,
      fechaEntrada: this.formatDateForResponse(reservation.fechaEntrada),
      fechaSalida: this.formatDateForResponse(reservation.fechaSalida),
      tipoHospedaje: reservation.esEspecial ? 'especial' : 'estandar',
      esEspecial: reservation.esEspecial,
      serviciosAdicionales: this.parseAdditionalServices(reservation.serviciosAdicionales),
      estado: reservation.estado,
      fechaCreacion: reservation.fechaCreacion.toISOString(),
    };
  }
}
