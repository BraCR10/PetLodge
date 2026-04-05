import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

const RESERVATION_STATUSES = ['CONFIRMADA', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA'] as const;

const toEnumStatus = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toUpperCase().replace(/ /g, '_') : value;

export class ReservationQueryDto {
  @ApiPropertyOptional({
    enum: RESERVATION_STATUSES,
    example: 'CONFIRMADA',
  })
  @IsOptional()
  @Transform(toEnumStatus)
  @IsString()
  @IsIn(RESERVATION_STATUSES)
  estado?: (typeof RESERVATION_STATUSES)[number];
}
