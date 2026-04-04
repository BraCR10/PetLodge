import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

const TIPOS = ['PERRO', 'GATO', 'CONEJO', 'PAJARO', 'OTRO'] as const;
const SEXOS = ['MACHO', 'HEMBRA'] as const;
const TAMANOS = ['PEQUENO', 'MEDIANO', 'GRANDE'] as const;

// Cross-field rule: anos=0 + meses=0 is never valid.
// anos=0 + meses≥1 is allowed (young pet). anos≥1 + meses=0 is allowed (exact years).
@ValidatorConstraint({ name: 'ageNotZero', async: false })
class AgeNotZeroConstraint implements ValidatorConstraintInterface {
  validate(meses: unknown, args: ValidationArguments): boolean {
    const obj = args.object as { anos?: number };
    const anos = obj.anos ?? 0;
    const m = typeof meses === 'number' ? meses : 0;
    return !(anos === 0 && m === 0);
  }

  defaultMessage(): string {
    return 'La edad no puede ser 0 años y 0 meses';
  }
}

const toInt = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? parseInt(value, 10) : value;

const toUpperCase = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toUpperCase() : value;

export class CreatePetDto {
  @ApiProperty({ example: 'Max' })
  @IsString({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;

  @ApiProperty({ enum: TIPOS, example: 'PERRO' })
  @Transform(toUpperCase)
  @IsIn(TIPOS, { message: 'El tipo debe ser PERRO, GATO, CONEJO, PAJARO u OTRO' })
  tipo: string;

  @ApiProperty({ example: 'Golden Retriever' })
  @IsString({ message: 'La raza es requerida' })
  raza: string;

  // ASCII field name — `años` with accent corrupts in multipart (same issue as tamano).
  // Response maps back to `años`. NormalizeEncodingInterceptor also accepts the accented form.
  @ApiProperty({ example: 2 })
  @Transform(toInt)
  @IsInt({ message: 'Los años deben ser un número entero' })
  @Min(0, { message: 'Los años no pueden ser negativos' })
  anos: number;

  // Optional — defaults to 0 in DB. Required when anos=0 (pet under 1 year old).
  // Valid range when provided: 0–11. Cross-field rule: anos=0 AND meses=0 is rejected.
  @ApiPropertyOptional({
    example: 6,
    description: 'Meses adicionales (0–11). Requerido si años es 0.',
  })
  @IsOptional()
  @Transform(toInt)
  @IsInt({ message: 'Los meses deben ser un número entero' })
  @Min(0, { message: 'Los meses no pueden ser negativos' })
  @Max(11, { message: 'Los meses no pueden superar 11' })
  @Validate(AgeNotZeroConstraint)
  meses?: number;

  @ApiProperty({ enum: SEXOS, example: 'MACHO' })
  @Transform(toUpperCase)
  @IsIn(SEXOS, { message: 'El sexo debe ser MACHO o HEMBRA' })
  sexo: string;

  @ApiProperty({ enum: TAMANOS, example: 'MEDIANO' })
  @Transform(toUpperCase)
  @IsIn(TAMANOS, { message: 'El tamaño debe ser PEQUENO, MEDIANO o GRANDE' })
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
