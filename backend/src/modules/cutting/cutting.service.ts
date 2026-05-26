import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';

@Injectable()
export class CuttingService {
  private readonly logger = new Logger(CuttingService.name);
  constructor(private readonly prisma: PrismaService, private readonly timelineService: TimelineService) {}

  async createRecord(data: any, userId: string) {
    const record = await this.prisma.cuttingRecord.create({ data });
    await this.timelineService.createEvent({ orderId: data.orderId, userId, eventType: 'CUTTING', title: 'Kesim kaydı oluşturuldu' });
    return record;
  }

  async updateRecord(id: string, data: any, userId: string) {
    const record = await this.prisma.cuttingRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Kesim kaydı bulunamadı.');
    const updateData: any = { ...data };
    if (data.status === 'IN_PROGRESS' && !record.startedAt) updateData.startedAt = new Date();
    if (data.status === 'COMPLETED') updateData.completedAt = new Date();
    if (data.fabricUsed && data.wasteAmount) {
      updateData.wastePercent = (data.wasteAmount / data.fabricUsed) * 100;
    }
    const updated = await this.prisma.cuttingRecord.update({ where: { id }, data: updateData });
    await this.timelineService.createEvent({ orderId: record.orderId, userId, eventType: 'CUTTING', title: `Kesim ${data.status === 'COMPLETED' ? 'tamamlandı' : 'güncellendi'}` });
    return updated;
  }

  async getOrderRecords(orderId: string) {
    return this.prisma.cuttingRecord.findMany({ where: { orderId }, orderBy: { createdAt: 'desc' } });
  }
}
