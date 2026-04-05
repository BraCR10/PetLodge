import { BadRequestException, Injectable } from '@nestjs/common';
import { Room } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Room[]> {
    return this.prisma.room.findMany({
      orderBy: { numero: 'asc' },
    });
  }

  async findAvailable(from: string, to: string): Promise<Room[]> {
    const fromDate = this.parseDateOnly(from, 'from');
    const toDate = this.parseDateOnly(to, 'to');

    if (fromDate >= toDate) {
      throw new BadRequestException('La fecha from debe ser anterior a la fecha to');
    }

    return this.prisma.room.findMany({
      where: {
        reservations: {
          none: {
            estado: { in: ['EN_PROGRESO', 'CONFIRMADA'] },
            fechaEntrada: { lt: toDate },
            fechaSalida: { gt: fromDate },
          },
        },
      },
      orderBy: { numero: 'asc' },
    });
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
      throw new BadRequestException(`La fecha ${fieldName} no es valida`);
    }

    return date;
  }
}
