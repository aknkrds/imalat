import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { QrcodeService } from './qrcode.service';

@ApiTags('QRCode') @ApiBearerAuth() @Controller('qrcode') @UseGuards(AuthGuard('jwt'))
export class QrcodeController {
  constructor(private readonly svc: QrcodeService) {}

  @Post('orders/:orderId') async generate(@Param('orderId') id: string) {
    const qr = await this.svc.generateQRCode(id);
    return { success: true, data: { qrCode: qr }, message: 'QR kod oluşturuldu.' };
  }

  @Get('orders/:orderId') async get(@Param('orderId') id: string) {
    const qr = await this.svc.getQRCode(id);
    return { success: true, data: { qrCode: qr } };
  }
}
