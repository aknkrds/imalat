import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SamplesService } from './samples.service';
import { CurrentUser } from '../../common/decorators';
import { JwtPayload } from '../../common/interfaces';

@ApiTags('Samples')
@ApiBearerAuth()
@Controller('samples')
@UseGuards(AuthGuard('jwt'))
export class SamplesController {
  constructor(private readonly samplesService: SamplesService) {}

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Sipariş numuneleri' })
  async getOrderSamples(@Param('orderId') orderId: string) {
    const data = await this.samplesService.getOrderSamples(orderId);
    return { success: true, data };
  }

  @Post()
  @ApiOperation({ summary: 'Numune oluştur' })
  async createSample(@Body() dto: { orderId: string; notes?: string }, @CurrentUser() user: JwtPayload) {
    const data = await this.samplesService.createSample(dto.orderId, dto.notes, user.sub);
    return { success: true, data, message: 'Numune oluşturuldu.' };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Numune güncelle' })
  async updateSample(@Param('id') id: string, @Body() dto: { status?: string; notes?: string }, @CurrentUser() user: JwtPayload) {
    const data = await this.samplesService.updateSample(id, dto, user.sub);
    return { success: true, data };
  }

  @Get('critiques/orders/:orderId')
  @ApiOperation({ summary: 'Sipariş numune kritikleri' })
  async getOrderCritiques(@Param('orderId') orderId: string) {
    const data = await this.samplesService.getOrderCritiques(orderId);
    return { success: true, data };
  }

  @Post('critiques')
  @ApiOperation({ summary: 'Numune kritiği ekle' })
  async addCritique(@Body() dto: { orderId: string; title: string; description: string; category: string }, @CurrentUser() user: JwtPayload) {
    const data = await this.samplesService.addCritique(dto, user.sub);
    return { success: true, data, message: 'Kritik eklendi.' };
  }

  @Put('critiques/:id')
  @ApiOperation({ summary: 'Kritik güncelle' })
  async updateCritique(@Param('id') id: string, @Body() dto: { status?: string; resolution?: string }, @CurrentUser() user: JwtPayload) {
    const data = await this.samplesService.updateCritique(id, dto, user.sub);
    return { success: true, data };
  }
}
