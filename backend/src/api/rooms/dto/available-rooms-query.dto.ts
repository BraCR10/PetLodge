import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class AvailableRoomsQueryDto {
  @ApiProperty({
    example: '2026-04-10',
    description: 'Start date in YYYY-MM-DD format',
  })
  @Matches(DATE_ONLY_REGEX, {
    message: 'La fecha from debe tener formato YYYY-MM-DD',
  })
  from!: string;

  @ApiProperty({
    example: '2026-04-12',
    description: 'End date in YYYY-MM-DD format',
  })
  @Matches(DATE_ONLY_REGEX, {
    message: 'La fecha to debe tener formato YYYY-MM-DD',
  })
  to!: string;
}
