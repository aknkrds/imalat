import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TimelineService } from './timeline.service';

@ApiTags('Timeline')
@ApiBearerAuth()
@Controller('timeline')
@UseGuards(AuthGuard('jwt'))
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Sipariş timeline' })
  async getOrderTimeline(
    @Param('orderId') orderId: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.timelineService.getOrderTimeline(orderId, limit || 50);
    return { success: true, data };
  }
}
