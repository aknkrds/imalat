import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';

@ApiTags('Audit') @ApiBearerAuth() @Controller('audit') @UseGuards(AuthGuard('jwt'), RolesGuard)
export class AuditController {
  constructor(private readonly svc: AuditService) {}

  @Get() @Roles('SUPER_ADMIN','ADMIN') async getRecent(@Query('page') page?: number, @Query('limit') limit?: number) {
    return { success: true, ...(await this.svc.getRecentLogs({ page: page || 1, limit: limit || 50 })) };
  }

  @Get('entity/:entity/:entityId') @Roles('SUPER_ADMIN','ADMIN') async getEntityLogs(@Param('entity') entity: string, @Param('entityId') entityId: string) {
    return { success: true, data: await this.svc.getEntityLogs(entity, entityId) };
  }
}
