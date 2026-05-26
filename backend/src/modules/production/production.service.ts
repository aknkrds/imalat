import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';

@Injectable()
export class ProductionService {
  private readonly logger = new Logger(ProductionService.name);
  constructor(private readonly prisma: PrismaService, private readonly timelineService: TimelineService) {}

  async createRecord(data: any, userId: string) {
    const record = await this.prisma.productionRecord.create({ data });
    await this.timelineService.createEvent({ orderId: data.orderId, userId, eventType: 'PRODUCTION', title: 'Üretim kaydı oluşturuldu' });
    return record;
  }

  async updateRecord(id: string, data: any, userId: string) {
    const record = await this.prisma.productionRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Üretim kaydı bulunamadı.');
    const updateData: any = { ...data };
    if (data.status === 'IN_PROGRESS' && !record.startedAt) updateData.startedAt = new Date();
    if (data.status === 'COMPLETED') updateData.completedAt = new Date();
    const updated = await this.prisma.productionRecord.update({ where: { id }, data: updateData });
    await this.timelineService.createEvent({ orderId: record.orderId, userId, eventType: 'PRODUCTION', title: `Üretim ${data.status === 'COMPLETED' ? 'tamamlandı' : 'güncellendi'}` });
    return updated;
  }

  async getOrderRecords(orderId: string) {
    return this.prisma.productionRecord.findMany({ where: { orderId }, orderBy: { createdAt: 'desc' } });
  }
}
