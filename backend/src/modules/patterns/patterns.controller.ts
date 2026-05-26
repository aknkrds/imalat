import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PatternsService } from './patterns.service';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { JwtPayload } from '../../common/interfaces';

@ApiTags('Patterns')
@ApiBearerAuth()
@Controller('patterns')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PatternsController {
  constructor(private readonly patternsService: PatternsService) {}

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Sipariş kalıp bilgileri' })
  async getOrderPatterns(@Param('orderId') orderId: string) {
    const data = await this.patternsService.getOrderPatterns(orderId);
    return { success: true, data };
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATION', 'MODELIST')
  @ApiOperation({ summary: 'Kalıp bilgisi oluştur' })
  async createPattern(@Body() dto: any, @CurrentUser() user: JwtPayload) {
    const data = await this.patternsService.createPattern(dto, user.sub);
    return { success: true, data, message: 'Kalıp bilgisi oluşturuldu.' };
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATION', 'MODELIST')
  @ApiOperation({ summary: 'Kalıp bilgisi güncelle' })
  async updatePattern(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: JwtPayload) {
    const data = await this.patternsService.updatePattern(id, dto, user.sub);
    return { success: true, data };
  }

  @Get('measurements/orders/:orderId')
  @ApiOperation({ summary: 'Sipariş ölçü tablosu' })
  async getOrderMeasurements(@Param('orderId') orderId: string) {
    const data = await this.patternsService.getOrderMeasurements(orderId);
    return { success: true, data };
  }

  @Post('measurements')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATION', 'MODELIST')
  @ApiOperation({ summary: 'Ölçü seti ekle' })
  async createMeasurementSet(@Body() dto: any, @CurrentUser() user: JwtPayload) {
    const data = await this.patternsService.createMeasurementSet(dto, user.sub);
    return { success: true, data, message: 'Ölçü seti eklendi.' };
  }

  @Delete('measurements/:id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATION', 'MODELIST')
  @ApiOperation({ summary: 'Ölçü seti sil' })
  async deleteMeasurementSet(@Param('id') id: string) {
    const result = await this.patternsService.deleteMeasurementSet(id);
    return { success: true, ...result };
  }
}
