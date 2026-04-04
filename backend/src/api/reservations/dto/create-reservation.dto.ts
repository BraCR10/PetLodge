import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const RESERVATION_TYPES = ['estandar', 'especial'] as const;
const ADDITIONAL_SERVICES = ['bano', 'paseo', 'alimentacion especial'] as const;

export class CreateReservationDto {
  @ApiProperty({ example: '8cbba379-262f-4ae8-b934-a4a4c396c77d' })
  @IsString()
  @IsNotEmpty()
  mascotaId: string;

  @ApiProperty({ example: '4f9a0d6c-7e2b-4a7c-a9bb-7f6ef6f5b2e1' })
  @IsString()
  @IsNotEmpty()
  habitacionId: string;

  @ApiProperty({ example: '2026-04-10' })
  @IsString()
  @IsNotEmpty()
  fechaEntrada: string;

  @ApiProperty({ example: '2026-04-12' })
  @IsString()
  @IsNotEmpty()
  fechaSalida: string;

  @ApiProperty({ enum: RESERVATION_TYPES, example: 'especial' })
  @IsString()
  @IsIn(RESERVATION_TYPES)
  tipoHospedaje: (typeof RESERVATION_TYPES)[number];

  @ApiPropertyOptional({
    type: [String],
    enum: ADDITIONAL_SERVICES,
    example: ['bano', 'paseo'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(ADDITIONAL_SERVICES, { each: true })
  serviciosAdicionales?: string[];
}
