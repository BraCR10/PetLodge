import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Matches, Min, ValidateIf } from 'class-validator';

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class RoomsQueryDto {
  @ApiPropertyOptional({ example: '2026-04-10', description: 'Start date in YYYY-MM-DD format' })
  @IsOptional()
  @Matches(DATE_ONLY_REGEX, { message: 'La fecha from debe tener formato YYYY-MM-DD' })
  from?: string;

  @ApiPropertyOptional({ example: '2026-04-12', description: 'End date in YYYY-MM-DD format' })
  @IsOptional()
  @Matches(DATE_ONLY_REGEX, { message: 'La fecha to debe tener formato YYYY-MM-DD' })
  // Require to when from is present
  @ValidateIf((o: RoomsQueryDto) => o.from !== undefined)
  to?: string;

  @ApiPropertyOptional({ example: 1, description: 'Page number (1-based)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}
