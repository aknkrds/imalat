import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CostingService, CreateCostItemDto, UpdateCostItemDto } from './costing.service';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { JwtPayload } from '../../common/interfaces';

@ApiTags('Costing')
@ApiBearerAuth()
@Controller('costing')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CostingController {
  constructor(private readonly costingService: CostingService) {}

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Sipariş maliyet kalemleri' })
  async getOrderCostItems(@Param('orderId') orderId: string) {
    const data = await this.costingService.getOrderCostItems(orderId);
    return { success: true, data };
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATION', 'CUSTOMER_REP')
  @ApiOperation({ summary: 'Maliyet kalemi ekle' })
  async addCostItem(@Body() dto: CreateCostItemDto, @CurrentUser() user: JwtPayload) {
    const data = await this.costingService.addCostItem(dto, user.sub);
    return { success: true, data, message: 'Maliyet kalemi eklendi.' };
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATION')
  @ApiOperation({ summary: 'Maliyet kalemi güncelle' })
  async updateCostItem(@Param('id') id: string, @Body() dto: UpdateCostItemDto, @CurrentUser() user: JwtPayload) {
    const data = await this.costingService.updateCostItem(id, dto, user.sub);
    return { success: true, data, message: 'Maliyet kalemi güncellendi.' };
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATION')
  @ApiOperation({ summary: 'Maliyet kalemi sil' })
  async removeCostItem(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const result = await this.costingService.removeCostItem(id, user.sub);
    return { success: true, ...result };
  }
}
