import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { JwtPayload } from '../../common/interfaces';

@ApiTags('Pricing')
@ApiBearerAuth()
@Controller('pricing')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Sipariş fiyatlandırma bilgileri' })
  async getOrderPricing(@Param('orderId') orderId: string) {
    const data = await this.pricingService.getOrderPricing(orderId);
    return { success: true, data };
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATION', 'CUSTOMER_REP')
  @ApiOperation({ summary: 'Fiyatlandırma kalemi ekle' })
  async addPricingItem(@Body() dto: any, @CurrentUser() user: JwtPayload) {
    const data = await this.pricingService.addPricingItem(dto, user.sub);
    return { success: true, data, message: 'Fiyatlandırma kalemi eklendi.' };
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATION')
  @ApiOperation({ summary: 'Fiyatlandırma kalemi güncelle' })
  async updatePricingItem(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: JwtPayload) {
    const data = await this.pricingService.updatePricingItem(id, dto, user.sub);
    return { success: true, data };
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATION')
  @ApiOperation({ summary: 'Fiyatlandırma kalemi sil' })
  async removePricingItem(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const result = await this.pricingService.removePricingItem(id, user.sub);
    return { success: true, ...result };
  }
}
