import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4', { message: 'mascotaId debe ser un UUID válido' })
  mascotaId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4', { message: 'habitacionId debe ser un UUID válido' })
  habitacionId: string;

  @ApiProperty({ example: '2026-04-15' })
  @IsDateString({}, { message: 'fechaEntrada debe ser una fecha válida (YYYY-MM-DD)' })
  fechaEntrada: string;

  @ApiProperty({ example: '2026-04-20' })
  @IsDateString({}, { message: 'fechaSalida debe ser una fecha válida (YYYY-MM-DD)' })
  fechaSalida: string;

  @ApiProperty({ example: false })
  @IsBoolean({ message: 'esEspecial debe ser booleano' })
  esEspecial: boolean;

  @ApiPropertyOptional({ example: 'paseo diario' })
  @IsOptional()
  @IsString({ message: 'serviciosAdicionales debe ser texto' })
  @MaxLength(255, { message: 'serviciosAdicionales no puede exceder 255 caracteres' })
  serviciosAdicionales?: string;
}
