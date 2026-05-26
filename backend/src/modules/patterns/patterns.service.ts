import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';

@Injectable()
export class PatternsService {
  private readonly logger = new Logger(PatternsService.name);
  constructor(private readonly prisma: PrismaService, private readonly timelineService: TimelineService) {}

  // Kalıp bilgisi oluştur (SAMPLE veya PRODUCTION)
  async createPattern(data: {
    orderId: string; type: string; modelistName?: string;
    fabricUsagePerUnit?: number; patternNotes?: string; technicalNotes?: string; metadata?: any;
  }, userId: string) {
    const pattern = await this.prisma.patternInfo.create({ data: { ...data, metadata: data.metadata || {} } });
    await this.timelineService.createEvent({
      orderId: data.orderId, userId, eventType: 'PATTERN',
      title: `${data.type === 'SAMPLE' ? 'Numune' : 'Üretim'} kalıbı oluşturuldu`,
    });
    return pattern;
  }

  async updatePattern(id: string, data: any, userId: string) {
    const pattern = await this.prisma.patternInfo.findUnique({ where: { id } });
    if (!pattern) throw new NotFoundException('Kalıp bilgisi bulunamadı.');
    const updated = await this.prisma.patternInfo.update({ where: { id }, data });
    await this.timelineService.createEvent({ orderId: pattern.orderId, userId, eventType: 'PATTERN', title: 'Kalıp bilgisi güncellendi' });
    return updated;
  }

  async getOrderPatterns(orderId: string) {
    return this.prisma.patternInfo.findMany({ where: { orderId }, orderBy: { createdAt: 'desc' } });
  }

  // Ölçü seti oluştur (beden bazlı)
  async createMeasurementSet(data: {
    orderId: string; size: string; quantity: number; sortOrder?: number;
    entries: { name: string; value: number; unit?: string; tolerance?: number }[];
  }, userId: string) {
    const set = await this.prisma.measurementSet.create({
      data: {
        orderId: data.orderId, size: data.size, quantity: data.quantity, sortOrder: data.sortOrder || 0,
        entries: {
          create: data.entries.map(e => ({ name: e.name, value: e.value, unit: e.unit || 'cm', tolerance: e.tolerance })),
        },
      },
      include: { entries: true },
    });
    await this.timelineService.createEvent({
      orderId: data.orderId, userId, eventType: 'PATTERN',
      title: `Ölçü tablosu eklendi: Beden ${data.size}`,
    });
    return set;
  }

  async updateMeasurementSet(id: string, data: any) {
    return this.prisma.measurementSet.update({ where: { id }, data });
  }

  async getOrderMeasurements(orderId: string) {
    return this.prisma.measurementSet.findMany({
      where: { orderId }, include: { entries: true }, orderBy: { sortOrder: 'asc' },
    });
  }

  async deleteMeasurementSet(id: string) {
    await this.prisma.measurementSet.delete({ where: { id } });
    return { message: 'Ölçü seti silindi.' };
  }
}
