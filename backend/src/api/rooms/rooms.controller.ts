import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AvailableRoomsQueryDto } from './dto/available-rooms-query.dto';
import { RoomResponseDto } from './dto/room-response.dto';
import { RoomsService } from './rooms.service';

@ApiTags('rooms')
@ApiBearerAuth()
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get('available')
  @ApiOperation({ summary: 'List available rooms for a date range' })
  @ApiQuery({ name: 'from', example: '2026-04-10', required: true })
  @ApiQuery({ name: 'to', example: '2026-04-12', required: true })
  @ApiOkResponse({
    description: 'Array of available rooms',
    type: RoomResponseDto,
    isArray: true,
  })
  findAvailable(@Query() query: AvailableRoomsQueryDto) {
    return this.roomsService.findAvailable(query.from, query.to);
  }

  @Get()
  @ApiOperation({ summary: 'List all rooms' })
  @ApiOkResponse({
    description: 'Array of rooms',
    type: RoomResponseDto,
    isArray: true,
  })
  findAll() {
    return this.roomsService.findAll();
  }
}
