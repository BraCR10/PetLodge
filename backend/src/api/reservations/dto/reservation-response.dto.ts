import { ApiProperty } from '@nestjs/swagger';

export class ReservationResponseDto {
  @ApiProperty({ example: '0f3bdb67-157e-4ab0-9f9d-117fca5a58d5' })
  id: string;

  @ApiProperty({ example: '8cbba379-262f-4ae8-b934-a4a4c396c77d' })
  mascotaId: string;

  @ApiProperty({ example: '4f9a0d6c-7e2b-4a7c-a9bb-7f6ef6f5b2e1' })
  habitacionId: string;

  @ApiProperty({ example: 'Milo' })
  nombreMascota: string;

  @ApiProperty({ example: 'Habitacion 11' })
  habitacion: string;

  @ApiProperty({ example: '2026-04-10' })
  fechaEntrada: string;

  @ApiProperty({ example: '2026-04-12' })
  fechaSalida: string;

  @ApiProperty({ example: 'especial' })
  tipoHospedaje: string;

  @ApiProperty({ example: true })
  esEspecial: boolean;

  @ApiProperty({ type: [String], example: ['bano', 'paseo'] })
  serviciosAdicionales: string[];

  @ApiProperty({ example: 'confirmada' })
  estado: string;

  @ApiProperty({ example: '2026-04-01T16:10:00.000Z' })
  fechaCreacion: string;
}
