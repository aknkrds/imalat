import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IssuesService } from './issues.service';
import { CurrentUser } from '../../common/decorators';
import { JwtPayload } from '../../common/interfaces';

@ApiTags('Issues') @ApiBearerAuth() @Controller('issues') @UseGuards(AuthGuard('jwt'))
export class IssuesController {
  constructor(private readonly svc: IssuesService) {}

  @Get('orders/:orderId') async getOrderIssues(@Param('orderId') id: string) { return { success: true, data: await this.svc.getOrderIssues(id) }; }
  @Post() async create(@Body() dto: any, @CurrentUser() u: JwtPayload) { return { success: true, data: await this.svc.create(dto, u.sub), message: 'Sorun bildirildi.' }; }
  @Put(':id') async update(@Param('id') id: string, @Body() dto: any, @CurrentUser() u: JwtPayload) { return { success: true, data: await this.svc.update(id, dto, u.sub) }; }
  @Get(':id/comments') async getComments(@Param('id') id: string) { return { success: true, data: await this.svc.getComments(id) }; }
  @Post(':id/comments') async addComment(@Param('id') id: string, @Body() dto: { content: string }, @CurrentUser() u: JwtPayload) { return { success: true, data: await this.svc.addComment(id, dto.content, u.sub) }; }
}
