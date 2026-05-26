import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';

@Injectable()
export class ShippingService {
  constructor(private readonly prisma: PrismaService, private readonly timelineService: TimelineService) {}

  async createRecord(data: any, userId: string) {
    const record = await this.prisma.shippingRecord.create({ data });
    await this.timelineService.createEvent({ orderId: data.orderId, userId, eventType: 'SHIPPING', title: 'Sevkiyat kaydı oluşturuldu' });
    return record;
  }

  async updateRecord(id: string, data: any, userId: string) {
    const record = await this.prisma.shippingRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Sevkiyat kaydı bulunamadı.');
    const updateData: any = { ...data };
    if (data.status === 'SHIPPED') updateData.shippedAt = new Date();
    if (data.status === 'DELIVERED') updateData.deliveredAt = new Date();
    if (data.shippedAt) updateData.shippedAt = new Date(data.shippedAt);
    const updated = await this.prisma.shippingRecord.update({ where: { id }, data: updateData });
    await this.timelineService.createEvent({ orderId: record.orderId, userId, eventType: 'SHIPPING', title: `Sevkiyat ${data.status === 'DELIVERED' ? 'teslim edildi' : 'güncellendi'}` });
    return updated;
  }

  async getOrderRecords(orderId: string) {
    return this.prisma.shippingRecord.findMany({ where: { orderId }, orderBy: { createdAt: 'desc' } });
  }
}
