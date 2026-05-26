import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CuttingService } from './cutting.service';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { JwtPayload } from '../../common/interfaces';

@ApiTags('Cutting')
@ApiBearerAuth()
@Controller('cutting')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CuttingController {
  constructor(private readonly cuttingService: CuttingService) {}

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Sipariş kesim kayıtları' })
  async getOrderRecords(@Param('orderId') orderId: string) { return { success: true, data: await this.cuttingService.getOrderRecords(orderId) }; }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATION', 'CUTTING')
  @ApiOperation({ summary: 'Kesim kaydı oluştur' })
  async create(@Body() dto: any, @CurrentUser() user: JwtPayload) {
    return { success: true, data: await this.cuttingService.createRecord(dto, user.sub), message: 'Kesim kaydı oluşturuldu.' };
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATION', 'CUTTING')
  @ApiOperation({ summary: 'Kesim kaydı güncelle' })
  async update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: JwtPayload) {
    return { success: true, data: await this.cuttingService.updateRecord(id, dto, user.sub) };
  }
}
