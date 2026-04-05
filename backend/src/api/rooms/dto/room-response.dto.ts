import { ApiProperty } from '@nestjs/swagger';

export class RoomResponseDto {
  @ApiProperty({ example: '4f9a0d6c-7e2b-4a7c-a9bb-7f6ef6f5b2e1' })
  id: string;

  @ApiProperty({ example: '101' })
  numero: string;
}
