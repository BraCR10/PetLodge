import { PartialType, PickType } from '@nestjs/swagger';
import { RegisterDto } from '../../auth/dto/register.dto';

export class UpdateUserDto extends PartialType(
  PickType(RegisterDto, ['nombre', 'numeroTelefono', 'direccion'] as const),
) {}
