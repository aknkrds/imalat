import { Controller, Get, Post, Delete, Param, UseGuards, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { CurrentUser } from '../../common/decorators';
import { JwtPayload } from '../../common/interfaces';

@ApiTags('Files') @ApiBearerAuth() @Controller('files') @UseGuards(AuthGuard('jwt'))
export class FilesController {
  constructor(private readonly svc: FilesService) {}

  @Get('orders/:orderId')
  async getOrderFiles(@Param('orderId') id: string) { return { success: true, data: await this.svc.getOrderFiles(id) }; }

  @Get('issues/:issueId')
  async getIssueFiles(@Param('issueId') id: string) { return { success: true, data: await this.svc.getIssueFiles(id) }; }

  @Post()
  async createRecord(@Body() dto: any, @CurrentUser() u: JwtPayload) {
    const data = await this.svc.createFileRecord({ ...dto, uploadedById: u.sub });
    return { success: true, data, message: 'Dosya kaydı oluşturuldu.' };
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string) { return { success: true, ...(await this.svc.deleteFile(id)) }; }
}
