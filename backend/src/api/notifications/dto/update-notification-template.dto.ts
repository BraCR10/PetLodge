import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateNotificationTemplateDto {
  @ApiPropertyOptional({ example: 'Reservation confirmed' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  subject?: string;

  @ApiPropertyOptional({
    example:
      'Dear {{name}},\n\nYour reservation for {{petName}} is confirmed.\n\nBest regards,\nPetLodge Team',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  body?: string;
}
