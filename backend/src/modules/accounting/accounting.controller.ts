import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AccountingService } from './accounting.service';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { JwtPayload } from '../../common/interfaces';

@ApiTags('Accounting') @ApiBearerAuth() @Controller('accounting') @UseGuards(AuthGuard('jwt'), RolesGuard)
export class AccountingController {
  constructor(private readonly svc: AccountingService) {}

  @Get('accounts')
  @Roles('SUPER_ADMIN','ADMIN','ACCOUNTING','OPERATION')
  @ApiOperation({ summary: 'Cari hesap listesi (T: Tedarikçi, M: Müşteri)' })
  async getAccounts(@CurrentUser() u: JwtPayload, @Query('type') type?: string, @Query('search') search?: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    const result = await this.svc.getAccounts(u.organizationId, { type, search, page: page || 1, limit: limit || 20 });
    return { success: true, ...result };
  }

  @Get('accounts/:id')
  @Roles('SUPER_ADMIN','ADMIN','ACCOUNTING','OPERATION')
  @ApiOperation({ summary: 'Cari hesap detay + işlemler' })
  async getAccountDetail(@Param('id') id: string) { return { success: true, data: await this.svc.getAccountDetail(id) }; }

  @Post('transactions')
  @Roles('SUPER_ADMIN','ADMIN','ACCOUNTING')
  @ApiOperation({ summary: 'Ödeme/Tahsilat ekle' })
  async addTransaction(@Body() dto: any) {
    const data = await this.svc.addTransaction(dto);
    return { success: true, data, message: 'İşlem eklendi.' };
  }

  @Delete('transactions/:id')
  @Roles('SUPER_ADMIN','ADMIN','ACCOUNTING')
  async removeTransaction(@Param('id') id: string) { return { success: true, ...(await this.svc.removeTransaction(id)) }; }
}
