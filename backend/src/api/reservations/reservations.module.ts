import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { ReservationsController } from './reservations.controller';
import { ReservationsScheduler } from './reservations.scheduler';
import { ReservationsService } from './reservations.service';

@Module({
  imports: [NotificationsModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsScheduler],
  exports: [ReservationsService],
})
export class ReservationsModule {}
