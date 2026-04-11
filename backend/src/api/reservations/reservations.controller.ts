import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationQueryDto } from './dto/reservation-query.dto';
import { ReservationResponseDto } from './dto/reservation-response.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsService } from './reservations.service';

@ApiTags('reservations')
@ApiBearerAuth()
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a reservation for the authenticated user' })
  @ApiCreatedResponse({
    description: 'Created reservation',
    type: ReservationResponseDto,
  })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateReservationDto) {
    return this.reservationsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List reservations for the authenticated user' })
  @ApiOkResponse({
    description: 'Array of reservations',
    type: ReservationResponseDto,
    isArray: true,
  })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: ReservationQueryDto) {
    return this.reservationsService.findAll(user.id, query.estado);
  }

  @Get('statuses')
  @ApiOperation({ summary: 'List all possible reservation statuses' })
  @ApiOkResponse({
    description: 'Array of reservation status values',
    schema: {
      type: 'array',
      items: { type: 'string', enum: ['CONFIRMADA', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA'] },
      example: ['CONFIRMADA', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA'],
    },
  })
  getStatuses() {
    return this.reservationsService.getStatuses();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a reservation by id' })
  @ApiOkResponse({
    description: 'Reservation detail',
    type: ReservationResponseDto,
  })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.reservationsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update reservation dates and/or additional services' })
  @ApiOkResponse({
    description: 'Updated reservation',
    type: ReservationResponseDto,
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel a reservation' })
  @ApiNoContentResponse({ description: 'Reservation cancelled' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.reservationsService.remove(id, user.id);
  }
}
