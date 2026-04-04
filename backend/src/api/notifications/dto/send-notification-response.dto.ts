import { ApiProperty } from '@nestjs/swagger';

export class SendNotificationResponseDto {
  @ApiProperty()
  sent: boolean;

  @ApiProperty({ nullable: true })
  error: string | null;

  @ApiProperty({ nullable: true })
  logId: string | null;
}
