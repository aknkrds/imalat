import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { JwtPayload } from '../../common/interfaces';

@ApiTags('Invoices') @ApiBearerAuth() @Controller('invoices') @UseGuards(AuthGuard('jwt'), RolesGuard)
export class InvoicesController {
  constructor(private readonly svc: InvoicesService) {}

  @Get()
  @Roles('SUPER_ADMIN','ADMIN','ACCOUNTING','OPERATION')
  @ApiOperation({ summary: 'Fatura listesi' })
  async findAll(@CurrentUser() u: JwtPayload, @Query('type') type?: string, @Query('orderId') orderId?: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    const result = await this.svc.findAll(u.organizationId, { type, orderId, page: page || 1, limit: limit || 20 });
    return { success: true, ...result };
  }

  @Get(':id')
  @Roles('SUPER_ADMIN','ADMIN','ACCOUNTING','OPERATION')
  async findOne(@Param('id') id: string) { return { success: true, data: await this.svc.findOne(id) }; }

  @Post()
  @Roles('SUPER_ADMIN','ADMIN','ACCOUNTING','OPERATION')
  @ApiOperation({ summary: 'Fatura bilgisi gir' })
  async create(@Body() dto: any, @CurrentUser() u: JwtPayload) {
    const data = await this.svc.create({ ...dto, organizationId: u.organizationId }, u.sub);
    return { success: true, data, message: 'Fatura bilgisi girildi.' };
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN','ADMIN','ACCOUNTING')
  async remove(@Param('id') id: string) { return { success: true, ...(await this.svc.remove(id)) }; }
}
