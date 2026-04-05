import { PartialType, PickType } from '@nestjs/swagger';
import { RegisterDto } from '../../auth/dto/register.dto';

export class UpdateUserDto extends PartialType(
  PickType(RegisterDto, [
    'nombre',
    'numeroIdentificacion',
    'email',
    'numeroTelefono',
    'direccion',
  ] as const),
) {}
