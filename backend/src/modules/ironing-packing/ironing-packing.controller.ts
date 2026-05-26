import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IroningPackingService } from './ironing-packing.service';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { JwtPayload } from '../../common/interfaces';

@ApiTags('IroningPacking') @ApiBearerAuth() @Controller('ironing-packing') @UseGuards(AuthGuard('jwt'), RolesGuard)
export class IroningPackingController {
  constructor(private readonly svc: IroningPackingService) {}
  @Get('orders/:orderId') async getRecords(@Param('orderId') id: string) { return { success: true, data: await this.svc.getOrderRecords(id) }; }
  @Post() @Roles('SUPER_ADMIN','ADMIN','OPERATION','IRONING_PACKING') async create(@Body() dto: any, @CurrentUser() u: JwtPayload) { return { success: true, data: await this.svc.createRecord(dto, u.sub), message: 'Ütü paket kaydı oluşturuldu.' }; }
  @Put(':id') @Roles('SUPER_ADMIN','ADMIN','OPERATION','IRONING_PACKING') async update(@Param('id') id: string, @Body() dto: any, @CurrentUser() u: JwtPayload) { return { success: true, data: await this.svc.updateRecord(id, dto, u.sub) }; }
}
