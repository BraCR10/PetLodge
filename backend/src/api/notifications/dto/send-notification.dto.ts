import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class SendNotificationDto {
  @ApiProperty({
    description: 'Target user ID. The email is taken from that user record.',
    example: '3fdc7ba0-6d88-4f85-9a0b-cdcbbe30f7d9',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({
    description: 'Optional reservation ID to attach to the notification log.',
    example: '2d5e74c3-b1e7-4cc1-a2b0-a64a70c9d80f',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  reservaId?: string;

  @ApiPropertyOptional({
    description: 'Variables used to replace {{key}} placeholders in the template.',
    example: {
      petName: 'Milo',
      checkInDate: '2026-04-10',
      checkOutDate: '2026-04-12',
      roomNumber: 'Habitacion 11',
    },
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, string | number | boolean | null>;
}
