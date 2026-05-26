import { Injectable, Logger } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QrcodeService {
  constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService) {}

  async generateQRCode(orderId: string): Promise<string> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, select: { orderNumber: true } });
    if (!order) throw new Error('Sipariş bulunamadı.');

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');
    const url = `${frontendUrl}/orders/${orderId}`;

    // QR kodu base64 data URL olarak oluştur
    const qrDataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#1a1a2e', light: '#ffffff' } });

    // QR kodunu sipariş kaydına kaydet
    await this.prisma.order.update({ where: { id: orderId }, data: { qrCode: qrDataUrl, barcode: order.orderNumber } });

    return qrDataUrl;
  }

  async getQRCode(orderId: string): Promise<string | null> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, select: { qrCode: true } });
    return order?.qrCode || null;
  }
}
