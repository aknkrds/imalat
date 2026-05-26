import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators';
import { JwtPayload } from '../../common/interfaces';

@ApiTags('Notifications') @ApiBearerAuth() @Controller('notifications') @UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Bildirimlerim' })
  async getNotifications(@CurrentUser() u: JwtPayload, @Query('isRead') isRead?: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    const result = await this.svc.getUserNotifications(u.sub, { isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined, page: page || 1, limit: limit || 20 });
    return { success: true, ...result };
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Bildirimi okundu işaretle' })
  async markAsRead(@Param('id') id: string) { return { success: true, data: await this.svc.markAsRead(id) }; }

  @Post('read-all')
  @ApiOperation({ summary: 'Tüm bildirimleri okundu işaretle' })
  async markAllAsRead(@CurrentUser() u: JwtPayload) { return { success: true, ...(await this.svc.markAllAsRead(u.sub)) }; }
}
