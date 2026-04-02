import { Module } from '@nestjs/common';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';

// PrismaModule and StorageModule are global — no explicit imports needed.
@Module({
  controllers: [PetsController],
  providers: [PetsService],
})
export class PetsModule {}
