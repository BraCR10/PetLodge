import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoomResponseDto {
  @ApiProperty({ example: '4f9a0d6c-7e2b-4a7c-a9bb-7f6ef6f5b2e1' })
  id: string;

  @ApiProperty({ example: '101' })
  numero: string;

  @ApiPropertyOptional({ example: 101, description: 'Numero de habitacion como entero.' })
  numeroInt?: number;

  @ApiPropertyOptional({
    example: true,
    description:
      'Whether the room is available for the requested date range. Only present when from/to are provided.',
  })
  disponible?: boolean;
}

export class RoomsPageResponseDto {
  @ApiProperty({ type: [RoomResponseDto] })
  data: RoomResponseDto[];

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}
