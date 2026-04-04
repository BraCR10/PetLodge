import { PartialType, PickType } from '@nestjs/swagger';
import { CreateReservationDto } from './create-reservation.dto';

export class UpdateReservationDto extends PartialType(
  PickType(CreateReservationDto, ['fechaEntrada', 'fechaSalida', 'serviciosAdicionales'] as const),
) {}
