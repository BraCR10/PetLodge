import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from 'class-validator';

const TIPOS = ['perro', 'gato', 'conejo', 'pajaro', 'otro'] as const;
const SEXOS = ['macho', 'hembra'] as const;
const TAMANOS = ['pequeño', 'mediano', 'grande'] as const;

export class CreatePetDto {
  @ApiProperty({ example: 'Max' })
  @IsString({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;

  @ApiProperty({ enum: TIPOS })
  @IsIn(TIPOS, { message: 'El tipo debe ser: perro, gato, conejo, pajaro u otro' })
  tipo: string;

  @ApiProperty({ example: 'Golden Retriever' })
  @IsString({ message: 'La raza es requerida' })
  raza: string;

  @ApiProperty({ example: 3 })
  // multipart/form-data sends all fields as strings — transform to number before validation.
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsInt({ message: 'La edad debe ser un número entero' })
  @Min(0, { message: 'La edad no puede ser negativa' })
  edad: number;

  @ApiProperty({ enum: SEXOS })
  @IsIn(SEXOS, { message: 'El sexo debe ser macho o hembra' })
  sexo: string;

  // ASCII field name avoids UTF-8 corruption of ñ in multipart form field names.
  // The response maps this back to `tamaño` to match the frontend Mascota type.
  // The NormalizeEncodingInterceptor also accepts `tamaño` and maps it here automatically.
  @ApiProperty({ enum: TAMANOS })
  @IsIn(TAMANOS, { message: 'El tamaño debe ser pequeño, mediano o grande' })
  tamano: string;

  @ApiProperty({ type: String, example: 'Sí, vacunado' })
  @IsString({ message: 'El estado de vacunación debe ser un texto válido' })
  @MaxLength(255, { message: 'El estado de vacunación no puede exceder 255 caracteres' })
  estadoVacunacion: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString({ message: 'Las condiciones médicas no son válidas' })
  @MaxLength(500, { message: 'Las condiciones médicas no pueden exceder 500 caracteres' })
  condicionesMedicas?: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @Matches(/^\+?[\d\s\-()]{7,20}$/, {
    message: 'El número de veterinario no es válido',
  })
  numeroVeterinario?: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString({ message: 'Los cuidados especiales no son válidos' })
  @MaxLength(500, { message: 'Los cuidados especiales no pueden exceder 500 caracteres' })
  cuidadosEspeciales?: string;

  // Declared so ValidationPipe does not reject it when clients include an empty foto
  // text part alongside the binary file upload. The actual file is handled by FileInterceptor.
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  @IsString()
  foto?: string;
}
