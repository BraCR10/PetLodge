import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

const RESERVATION_STATES = ['CONFIRMADA', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA'] as const;

const toUpperCase = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toUpperCase().replace(/ /g, '_') : value;

export class ListReservationsQueryDto {
  @ApiPropertyOptional({ enum: RESERVATION_STATES })
  @IsOptional()
  @Transform(toUpperCase)
  @IsIn(RESERVATION_STATES, {
    message: 'estado debe ser CONFIRMADA, EN_PROGRESO, COMPLETADA o CANCELADA',
  })
  estado?: (typeof RESERVATION_STATES)[number];
}
