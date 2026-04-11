import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const toLowerTrim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toLowerCase().trim() : value;

export class RegisterDto {
  @ApiProperty()
  @IsString({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;

  @ApiProperty()
  @IsString({ message: 'El número de identificación es requerido' })
  @MinLength(5, { message: 'La identificación debe tener al menos 5 caracteres' })
  @MaxLength(20, { message: 'La identificación no puede exceder 20 caracteres' })
  numeroIdentificacion: string;

  @ApiProperty()
  @Transform(toLowerTrim)
  @IsEmail({}, { message: 'El correo no es válido' })
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^\+?[\d\s\-()]{7,20}$/, {
    message: 'El número de teléfono no es válido',
  })
  numeroTelefono?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'La dirección no es válida' })
  direccion?: string;
}
