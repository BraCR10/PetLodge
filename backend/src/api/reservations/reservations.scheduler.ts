import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma, ReservationStatus } from '../../../generated/prisma/client';
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

    await this.transitionToInProgress(today);
    await this.transitionToCompleted(today);
  }

  /**
   * CONFIRMADA -> EN_PROGRESO when fechaEntrada <= today and fechaSalida > today
   */
  private async transitionToInProgress(today: Date): Promise<void> {
    const count = await this.prisma.$executeRaw(
      Prisma.sql`
        UPDATE "Reservation"
        SET "estado" = ${ReservationStatus.EN_PROGRESO}
        WHERE "estado" = ${ReservationStatus.CONFIRMADA}
          AND "fechaEntrada" <= ${today}
          AND "fechaSalida" > ${today}
      `,
    );

    if (count > 0) {
      this.logger.log(`Transitioned ${count} reservation(s) CONFIRMADA -> EN_PROGRESO`);
    }
  }

  /**
   * EN_PROGRESO -> COMPLETADA when fechaSalida <= today
   */
  private async transitionToCompleted(today: Date): Promise<void> {
    const count = await this.prisma.$executeRaw(
      Prisma.sql`
        UPDATE "Reservation"
        SET "estado" = ${ReservationStatus.COMPLETADA}
        WHERE "estado" = ${ReservationStatus.EN_PROGRESO}
          AND "fechaSalida" <= ${today}
      `,
    );

    if (count > 0) {
      this.logger.log(`Transitioned ${count} reservation(s) EN_PROGRESO -> COMPLETADA`);
    }
  }
}
