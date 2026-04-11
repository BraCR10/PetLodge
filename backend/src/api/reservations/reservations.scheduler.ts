import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReservationStatus } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReservationsScheduler {
  private readonly logger = new Logger(ReservationsScheduler.name);

  constructor(private readonly prisma: PrismaService) {}

  // Runs every day at midnight UTC-6 (America/Costa_Rica)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'America/Costa_Rica' })
  async syncReservationStatuses(): Promise<void> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await Promise.all([this.transitionToInProgress(today), this.transitionToCompleted(today)]);
  }

  /**
   * CONFIRMADA -> EN_PROGRESO when fechaEntrada <= today and fechaSalida > today
   */
  private async transitionToInProgress(today: Date): Promise<void> {
    const { count } = await this.prisma.reservation.updateMany({
      where: {
        estado: ReservationStatus.CONFIRMADA,
        fechaEntrada: { lte: today },
        fechaSalida: { gt: today },
      },
      data: { estado: ReservationStatus.EN_PROGRESO },
    });

    if (count > 0) {
      this.logger.log(`Transitioned ${count} reservation(s) CONFIRMADA -> EN_PROGRESO`);
    }
  }

  /**
   * EN_PROGRESO -> COMPLETADA when fechaSalida <= today
   */
  private async transitionToCompleted(today: Date): Promise<void> {
    const { count } = await this.prisma.reservation.updateMany({
      where: {
        estado: ReservationStatus.EN_PROGRESO,
        fechaSalida: { lte: today },
      },
      data: { estado: ReservationStatus.COMPLETADA },
    });

    if (count > 0) {
      this.logger.log(`Transitioned ${count} reservation(s) EN_PROGRESO -> COMPLETADA`);
    }
  }
}
