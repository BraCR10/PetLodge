import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsEmail({}, { message: 'El correo no es válido' })
  email: string;

  @ApiProperty()
  @IsString({ message: 'La contraseña es requerida' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;
}
