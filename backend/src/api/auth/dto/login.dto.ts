import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

const toLowerTrim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toLowerCase().trim() : value;

export class LoginDto {
  @ApiProperty()
  @Transform(toLowerTrim)
  @IsEmail({}, { message: 'El correo no es válido' })
  email: string;

  @ApiProperty()
  @IsString({ message: 'La contraseña es requerida' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;
}
