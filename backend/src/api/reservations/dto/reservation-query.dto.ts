import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

const RESERVATION_STATUSES = ['confirmada', 'en progreso', 'completada', 'cancelada'] as const;

export class ReservationQueryDto {
  @ApiPropertyOptional({
    enum: RESERVATION_STATUSES,
    example: 'confirmada',
  })
  @IsOptional()
  @IsString()
  @IsIn(RESERVATION_STATUSES)
  estado?: (typeof RESERVATION_STATUSES)[number];
}
