import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsString({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiProperty()
  @IsString({ message: 'El número de identificación es requerido' })
  numeroIdentificacion: string;

  @ApiProperty()
  @IsEmail({}, { message: 'El correo no es válido' })
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^\+?[\d\s\-()]{7,20}$/, { message: 'El número de teléfono no es válido' })
  numeroTelefono?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'La dirección no es válida' })
  direccion?: string;
}
