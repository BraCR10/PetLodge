import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PetsModule } from './pets/pets.module';
import { RoomsModule } from './rooms/rooms.module';
import { UsersModule } from './users/users.module';

/**
 * Aggregates all API feature modules. Add new feature modules here as they are implemented.
 * AppModule imports only this module for feature routing — keeping infrastructure and features separate.
 */
@Module({
  imports: [AuthModule, UsersModule, PetsModule, RoomsModule, NotificationsModule],
})
export class ApiModule {}
