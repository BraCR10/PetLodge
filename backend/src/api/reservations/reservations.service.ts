import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reservation, ReservationStatus } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

type ReservationResponse = {
  id: string;
  nombreMascota: string;
  fechaEntrada: string;
  fechaSalida: string;
  habitacionId: string;
  estado: string;
  esEspecial: boolean;
  serviciosAdicionales?: string;
};

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReservationDto): Promise<ReservationResponse> {
    await this.assertPetOwnership(dto.mascotaId, userId);
    await this.assertRoomExists(dto.habitacionId);
    this.validateServiceRule(dto.esEspecial, dto.serviciosAdicionales);

    const fechaEntrada = this.parseDate(dto.fechaEntrada, 'fechaEntrada');
    const fechaSalida = this.parseDate(dto.fechaSalida, 'fechaSalida');
    this.validateDateRange(fechaEntrada, fechaSalida);

    await this.assertNoOverlap(dto.habitacionId, fechaEntrada, fechaSalida);

    const reservation = await this.prisma.reservation.create({
      data: {
        userId,
        mascotaId: dto.mascotaId,
        habitacionId: dto.habitacionId,
        fechaEntrada,
        fechaSalida,
        esEspecial: dto.esEspecial,
        serviciosAdicionales: dto.serviciosAdicionales ?? null,
        estado: 'CONFIRMADA',
      },
    });

    const pet = await this.prisma.pet.findUnique({
      where: { id: reservation.mascotaId },
      select: { nombre: true },
    });

    return this.toResponse(reservation, pet?.nombre ?? 'Desconocido');
  }

  async findAll(userId: string, estado?: string): Promise<ReservationResponse[]> {
    const reservations = await this.prisma.reservation.findMany({
      where: {
        userId,
        ...(estado && { estado: estado as ReservationStatus }),
      },
      orderBy: { fechaEntrada: 'desc' },
    });

    const results: ReservationResponse[] = [];
    for (const reservation of reservations) {
      const pet = await this.prisma.pet.findUnique({
        where: { id: reservation.mascotaId },
        select: { nombre: true },
      });
      results.push(this.toResponse(reservation, pet?.nombre ?? 'Desconocido'));
    }

    return results;
  }

  async findOne(id: string, userId: string): Promise<ReservationResponse> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (reservation.userId !== userId) {
      throw new ForbiddenException('No tienes permisos sobre esta reserva');
    }

    const pet = await this.prisma.pet.findUnique({
      where: { id: reservation.mascotaId },
      select: { nombre: true, userId: true },
    });

    if (!pet || pet.userId !== userId) {
      throw new ForbiddenException('No tienes permisos sobre esta reserva');
    }

    return this.toResponse(reservation, pet.nombre);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateReservationDto,
  ): Promise<ReservationResponse> {
    const existing = await this.assertOwnership(id, userId);

    if (existing.estado !== 'CONFIRMADA') {
      throw new BadRequestException('Solo se pueden modificar reservas en estado confirmada');
    }

    const nextEsEspecial = dto.esEspecial ?? existing.esEspecial;
    const nextServiciosAdicionales = dto.serviciosAdicionales ?? existing.serviciosAdicionales;

    this.validateServiceRule(nextEsEspecial, nextServiciosAdicionales);

    const fechaEntrada = this.parseDate(
      dto.fechaEntrada ?? existing.fechaEntrada.toISOString(),
      'fechaEntrada',
    );
    const fechaSalida = this.parseDate(
      dto.fechaSalida ?? existing.fechaSalida.toISOString(),
      'fechaSalida',
    );

    this.validateDateRange(fechaEntrada, fechaSalida);

    await this.assertNoOverlap(existing.habitacionId, fechaEntrada, fechaSalida, id);

    const updated = await this.prisma.reservation.update({
      where: { id },
      data: {
        fechaEntrada,
        fechaSalida,
        esEspecial: nextEsEspecial,
        serviciosAdicionales: nextServiciosAdicionales,
      },
    });

    const pet = await this.prisma.pet.findUnique({
      where: { id: updated.mascotaId },
      select: { nombre: true },
    });

    return this.toResponse(updated, pet?.nombre ?? 'Desconocido');
  }

  async cancel(id: string, userId: string): Promise<void> {
    await this.assertOwnership(id, userId);

    await this.prisma.reservation.update({
      where: { id },
      data: { estado: 'CANCELADA' },
    });
  }

  private async assertPetOwnership(mascotaId: string, userId: string): Promise<void> {
    const pet = await this.prisma.pet.findUnique({ where: { id: mascotaId } });

    if (!pet || !pet.isActive || pet.userId !== userId) {
      throw new ForbiddenException('La mascota no pertenece al usuario autenticado');
    }
  }

  private async assertRoomExists(habitacionId: string): Promise<void> {
    const room = await this.prisma.room.findUnique({ where: { id: habitacionId } });

    if (!room) {
      throw new NotFoundException('Habitación no encontrada');
    }
  }

  private validateServiceRule(esEspecial: boolean, serviciosAdicionales?: string | null): void {
    if (!esEspecial && serviciosAdicionales) {
      throw new BadRequestException(
        'serviciosAdicionales solo se permite cuando esEspecial es true',
      );
    }
  }

  private parseDate(value: string, field: 'fechaEntrada' | 'fechaSalida'): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${field} debe ser una fecha válida`);
    }
    return date;
  }

  private validateDateRange(fechaEntrada: Date, fechaSalida: Date): void {
    if (fechaEntrada >= fechaSalida) {
      throw new BadRequestException('fechaEntrada debe ser menor que fechaSalida');
    }
  }

  private async assertNoOverlap(
    habitacionId: string,
    fechaEntrada: Date,
    fechaSalida: Date,
    ignoreReservationId?: string,
  ): Promise<void> {
    const overlapping = await this.prisma.reservation.findFirst({
      where: {
        habitacionId,
        estado: { in: ['CONFIRMADA', 'EN_PROGRESO'] },
        fechaEntrada: { lt: fechaSalida },
        fechaSalida: { gt: fechaEntrada },
        ...(ignoreReservationId && { id: { not: ignoreReservationId } }),
      },
      select: { id: true },
    });

    if (overlapping) {
      throw new ConflictException(
        'La habitación ya tiene una reserva activa en ese rango de fechas',
      );
    }
  }

  private async assertOwnership(id: string, userId: string): Promise<Reservation> {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });

    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (reservation.userId !== userId) {
      throw new ForbiddenException('No tienes permisos sobre esta reserva');
    }

    return reservation;
  }

  private toResponse(reservation: Reservation, nombreMascota: string): ReservationResponse {
    return {
      id: reservation.id,
      nombreMascota,
      fechaEntrada: reservation.fechaEntrada.toISOString(),
      fechaSalida: reservation.fechaSalida.toISOString(),
      habitacionId: reservation.habitacionId,
      estado: reservation.estado,
      esEspecial: reservation.esEspecial,
      serviciosAdicionales: reservation.serviciosAdicionales ?? undefined,
    };
  }
}
