import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { JwtPayload } from '../../common/interfaces';

@ApiTags('Reports') @ApiBearerAuth() @Controller('reports') @UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Get('dashboard')
  @Roles('SUPER_ADMIN','ADMIN','OPERATION')
  @ApiOperation({ summary: 'Dashboard istatistikleri' })
  async getDashboard(@CurrentUser() u: JwtPayload) {
    return { success: true, data: await this.svc.getDashboardStats(u.organizationId) };
  }
}
