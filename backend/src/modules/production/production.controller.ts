import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProductionService } from './production.service';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { JwtPayload } from '../../common/interfaces';

@ApiTags('Production') @ApiBearerAuth() @Controller('production') @UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProductionController {
  constructor(private readonly svc: ProductionService) {}
  @Get('orders/:orderId') async getRecords(@Param('orderId') id: string) { return { success: true, data: await this.svc.getOrderRecords(id) }; }
  @Post() @Roles('SUPER_ADMIN','ADMIN','OPERATION','PRODUCTION') async create(@Body() dto: any, @CurrentUser() u: JwtPayload) { return { success: true, data: await this.svc.createRecord(dto, u.sub), message: 'Üretim kaydı oluşturuldu.' }; }
  @Put(':id') @Roles('SUPER_ADMIN','ADMIN','OPERATION','PRODUCTION') async update(@Param('id') id: string, @Body() dto: any, @CurrentUser() u: JwtPayload) { return { success: true, data: await this.svc.updateRecord(id, dto, u.sub) }; }
}
