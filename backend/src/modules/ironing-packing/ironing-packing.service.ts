import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';

@Injectable()
export class IroningPackingService {
  private readonly logger = new Logger(IroningPackingService.name);
  constructor(private readonly prisma: PrismaService, private readonly timelineService: TimelineService) {}

  async createRecord(data: any, userId: string) {
    const record = await this.prisma.ironingPackingRecord.create({ data });
    await this.timelineService.createEvent({ orderId: data.orderId, userId, eventType: 'IRONING', title: 'Ütü paket kaydı oluşturuldu' });
    return record;
  }

  async updateRecord(id: string, data: any, userId: string) {
    const record = await this.prisma.ironingPackingRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Ütü paket kaydı bulunamadı.');
    const updateData: any = { ...data };
    if (data.status === 'IN_PROGRESS' && !record.startedAt) updateData.startedAt = new Date();
    if (data.status === 'COMPLETED') updateData.completedAt = new Date();
    const updated = await this.prisma.ironingPackingRecord.update({ where: { id }, data: updateData });
    await this.timelineService.createEvent({ orderId: record.orderId, userId, eventType: 'IRONING', title: `Ütü paket ${data.status === 'COMPLETED' ? 'tamamlandı' : 'güncellendi'}` });
    return updated;
  }

  async getOrderRecords(orderId: string) {
    return this.prisma.ironingPackingRecord.findMany({ where: { orderId }, orderBy: { createdAt: 'desc' } });
  }
}
