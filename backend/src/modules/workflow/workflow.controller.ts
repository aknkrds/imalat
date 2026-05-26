import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WorkflowService } from './workflow.service';
import { WorkflowEngine } from './workflow-engine';
import { CurrentUser } from '../../common/decorators';
import { JwtPayload } from '../../common/interfaces';

@ApiTags('Workflow')
@ApiBearerAuth()
@Controller('workflow')
@UseGuards(AuthGuard('jwt'))
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly workflowEngine: WorkflowEngine,
  ) {}

  @Get('states')
  @ApiOperation({ summary: 'Tüm workflow durumlarını listele' })
  async getStates() {
    const data = await this.workflowService.getStates();
    return { success: true, data };
  }

  @Get('transitions')
  @ApiOperation({ summary: 'Tüm geçiş tanımlarını listele' })
  async getTransitionDefs() {
    const data = await this.workflowService.getTransitionDefs();
    return { success: true, data };
  }

  @Get('orders/:orderId/available-transitions')
  @ApiOperation({ summary: 'Sipariş için mevcut geçişleri listele' })
  async getAvailableTransitions(
    @Param('orderId') orderId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.workflowEngine.getAvailableTransitions(orderId, user.roles);
    return { success: true, data };
  }

  @Post('orders/:orderId/transition')
  @ApiOperation({ summary: 'Sipariş durumu geçişi yap' })
  async executeTransition(
    @Param('orderId') orderId: string,
    @Body() body: { toStateCode: string; note?: string; metadata?: any },
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.workflowEngine.executeTransition(
      orderId,
      body.toStateCode,
      user,
      { note: body.note, metadata: body.metadata },
    );
    return {
      success: true,
      data: result,
      message: 'Durum geçişi başarılı.',
    };
  }
}
