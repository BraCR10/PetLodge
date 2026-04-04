import { ApiProperty } from '@nestjs/swagger';
import { TipoNotificacion } from '../../../../generated/prisma/client';

export class NotificationTemplateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: TipoNotificacion })
  tipo: TipoNotificacion;

  @ApiProperty()
  name: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  body: string;

  @ApiProperty({ type: [String] })
  variables: string[];
}
