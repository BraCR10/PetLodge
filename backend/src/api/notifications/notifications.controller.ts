import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { NotificationLogResponseDto } from './dto/notification-log-response.dto';
import { NotificationTemplateResponseDto } from './dto/notification-template-response.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { SendNotificationResponseDto } from './dto/send-notification-response.dto';
import { UpdateNotificationTemplateDto } from './dto/update-notification-template.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('templates')
  @Roles('admin')
  @ApiOperation({ summary: 'List all notification templates' })
  @ApiOkResponse({
    description: 'Array of notification templates',
    type: NotificationTemplateResponseDto,
    isArray: true,
  })
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get('templates/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get one notification template by ID' })
  @ApiOkResponse({
    description: 'Notification template',
    type: NotificationTemplateResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch('templates/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a notification template subject and/or body' })
  @ApiOkResponse({
    description: 'Updated notification template',
    type: NotificationTemplateResponseDto,
  })
  update(@Param('id') id: string, @Body() dto: UpdateNotificationTemplateDto) {
    return this.notificationsService.update(id, dto);
  }

  @Post('send/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Manually send a notification template for testing' })
  @ApiOkResponse({
    description: 'Notification send result',
    type: SendNotificationResponseDto,
  })
  send(@Param('id') id: string, @Body() dto: SendNotificationDto) {
    return this.notificationsService.send(id, dto.userId, dto.variables, dto.reservaId);
  }

  @Get('logs')
  @ApiOperation({ summary: 'List the authenticated user notification send history' })
  @ApiOkResponse({
    description: 'Notification send logs for the authenticated user',
    type: NotificationLogResponseDto,
    isArray: true,
  })
  findLogs(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.findLogs(user.id);
  }
}
