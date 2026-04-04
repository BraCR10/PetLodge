import { ApiProperty } from '@nestjs/swagger';
import { TipoNotificacion } from '../../../../generated/prisma/client';

class NotificationLogTemplateDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: TipoNotificacion })
  tipo: TipoNotificacion;

  @ApiProperty()
  name: string;

  @ApiProperty()
  subject: string;
}

export class NotificationLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: TipoNotificacion })
  tipo: TipoNotificacion;

  @ApiProperty()
  enviado: boolean;

  @ApiProperty({ nullable: true })
  error: string | null;

  @ApiProperty()
  fechaEnvio: string;

  @ApiProperty({ nullable: true })
  reservaId: string | null;

  @ApiProperty({ type: NotificationLogTemplateDto })
  template: NotificationLogTemplateDto;
}
