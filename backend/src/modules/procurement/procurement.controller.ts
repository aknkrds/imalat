import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProcurementService } from './procurement.service';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { JwtPayload } from '../../common/interfaces';

@ApiTags('Procurement')
@ApiBearerAuth()
@Controller('procurement')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Sipariş tedarik kalemleri' })
  async getOrderItems(@Param('orderId') orderId: string) {
    const data = await this.procurementService.getOrderItems(orderId);
    return { success: true, data };
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATION', 'WAREHOUSE')
  @ApiOperation({ summary: 'Tedarik kalemi ekle' })
  async addItem(@Body() dto: any, @CurrentUser() user: JwtPayload) {
    const data = await this.procurementService.addItem(dto, user.sub);
    return { success: true, data, message: 'Tedarik kalemi eklendi.' };
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATION', 'WAREHOUSE')
  @ApiOperation({ summary: 'Tedarik kalemi güncelle' })
  async updateItem(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: JwtPayload) {
    const data = await this.procurementService.updateItem(id, dto, user.sub);
    return { success: true, data };
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATION')
  @ApiOperation({ summary: 'Tedarik kalemi sil' })
  async removeItem(@Param('id') id: string) {
    const result = await this.procurementService.removeItem(id);
    return { success: true, ...result };
  }
}
