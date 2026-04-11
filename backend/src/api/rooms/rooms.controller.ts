import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoomsPageResponseDto } from './dto/room-response.dto';
import { RoomsQueryDto } from './dto/rooms-query.dto';
import { RoomsService } from './rooms.service';

@ApiTags('rooms')
@ApiBearerAuth()
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @ApiOperation({
    summary: 'List rooms with pagination',
    description:
      'Returns a paginated list of rooms. When from/to are provided, each room includes a `disponible` field indicating availability for that date range.',
  })
  @ApiOkResponse({ type: RoomsPageResponseDto })
  findAll(@Query() query: RoomsQueryDto) {
    return this.roomsService.findAll(query.page ?? 1, query.from, query.to);
  }
}
