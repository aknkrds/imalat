import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';

@Injectable()
export class SamplesService {
  private readonly logger = new Logger(SamplesService.name);
  constructor(private readonly prisma: PrismaService, private readonly timelineService: TimelineService) {}

  async createSample(orderId: string, notes: string | undefined, userId: string) {
    const count = await this.prisma.sampleRecord.count({ where: { orderId } });
    const sample = await this.prisma.sampleRecord.create({
      data: { orderId, sampleNo: count + 1, notes },
    });
    await this.timelineService.createEvent({ orderId, userId, eventType: 'SAMPLE', title: `Numune #${sample.sampleNo} oluşturuldu` });
    return sample;
  }

  async updateSample(id: string, data: { status?: string; notes?: string }, userId: string) {
    const sample = await this.prisma.sampleRecord.findUnique({ where: { id } });
    if (!sample) throw new NotFoundException('Numune bulunamadı.');
    const updateData: any = { ...data };
    if (data.status === 'COMPLETED') updateData.completedAt = new Date();
    if (data.status === 'APPROVED') updateData.approvedAt = new Date();
    const updated = await this.prisma.sampleRecord.update({ where: { id }, data: updateData });
    await this.timelineService.createEvent({ orderId: sample.orderId, userId, eventType: 'SAMPLE', title: `Numune #${sample.sampleNo} güncellendi: ${data.status || 'bilgi'}` });
    return updated;
  }

  async getOrderSamples(orderId: string) {
    return this.prisma.sampleRecord.findMany({ where: { orderId }, orderBy: { sampleNo: 'desc' } });
  }

  async addCritique(data: { orderId: string; title: string; description: string; category: string }, userId: string) {
    const critique = await this.prisma.sampleCritique.create({ data });
    await this.timelineService.createEvent({ orderId: data.orderId, userId, eventType: 'CRITIQUE', title: `Numune kritiği: ${data.title}` });
    return critique;
  }

  async updateCritique(id: string, data: { status?: string; resolution?: string }, userId: string) {
    const critique = await this.prisma.sampleCritique.findUnique({ where: { id } });
    if (!critique) throw new NotFoundException('Kritik bulunamadı.');
    const updateData: any = { ...data };
    if (data.status === 'RESOLVED') updateData.resolvedAt = new Date();
    const updated = await this.prisma.sampleCritique.update({ where: { id }, data: updateData });
    await this.timelineService.createEvent({ orderId: critique.orderId, userId, eventType: 'CRITIQUE', title: `Kritik güncellendi: ${critique.title}` });
    return updated;
  }

  async getOrderCritiques(orderId: string) {
    return this.prisma.sampleCritique.findMany({ where: { orderId }, orderBy: { createdAt: 'desc' } });
  }
}
