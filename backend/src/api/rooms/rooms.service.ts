import { BadRequestException, Injectable } from '@nestjs/common';
import { Room } from '../../../generated/prisma/client';
import { errorResponse } from '../../common/errors/error-response';
import { PrismaService } from '../../prisma/prisma.service';
import { RoomsPageResponseDto, RoomResponseDto } from './dto/room-response.dto';

const PAGE_SIZE = 10;

type RoomWithReservations = Room & { reservations?: { id: string }[] };

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number, from?: string, to?: string): Promise<RoomsPageResponseDto> {
    const dateRange = this.resolveDateRange(from, to);

    // Fetch all rooms so we can sort numerically before paginating.
    // Paginating first and sorting after produces wrong cross-page ordering
    // because the DB sorts room numbers as strings ("10" < "2").
    const allRooms = (await this.prisma.room.findMany({
      include: dateRange
        ? {
            reservations: {
              where: {
                estado: { in: ['EN_PROGRESO', 'CONFIRMADA'] },
                fechaEntrada: { lte: dateRange.to },
                fechaSalida: { gte: dateRange.from },
              },
              select: { id: true },
            },
          }
        : undefined,
    })) as RoomWithReservations[];

    allRooms.sort((a, b) => {
      const numA = parseInt(a.numero, 10);
      const numB = parseInt(b.numero, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.numero.localeCompare(b.numero);
    });

    const total = allRooms.length;
    const skip = (page - 1) * PAGE_SIZE;
    const pageRooms = allRooms.slice(skip, skip + PAGE_SIZE);

    const data: RoomResponseDto[] = pageRooms.map((room) => {
      const numeroInt = Number.parseInt(room.numero, 10);
      const result: RoomResponseDto = {
        id: room.id,
        numero: room.numero,
        numeroInt: Number.isNaN(numeroInt) ? undefined : numeroInt,
      };
      if (dateRange) {
        result.disponible = (room.reservations ?? []).length === 0;
      }
      return result;
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  }

  private resolveDateRange(from?: string, to?: string): { from: Date; to: Date } | null {
    if (!from || !to) return null;

    const fromDate = this.parseDateOnly(from, 'from');
    const toDate = this.parseDateOnly(to, 'to');

    if (fromDate >= toDate) {
      throw new BadRequestException(
        errorResponse('INVALID_DATE_RANGE', 'La fecha from debe ser anterior a la fecha to'),
      );
    }

    return { from: fromDate, to: toDate };
  }

  private parseDateOnly(value: string, fieldName: 'from' | 'to'): Date {
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
}
