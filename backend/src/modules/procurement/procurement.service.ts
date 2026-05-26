import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';

@Injectable()
export class ProcurementService {
  private readonly logger = new Logger(ProcurementService.name);
  constructor(private readonly prisma: PrismaService, private readonly timelineService: TimelineService) {}

  async addItem(data: {
    orderId: string; contactId?: string; category: string; name: string; description?: string;
    quantity: number; unit: string; unitPrice?: number; totalPrice?: number; currency?: string;
    expectedAt?: string; notes?: string;
  }, userId: string) {
    const totalPrice = data.totalPrice || (data.unitPrice ? data.quantity * data.unitPrice : undefined);
    const item = await this.prisma.procurementItem.create({
      data: {
        orderId: data.orderId, contactId: data.contactId, category: data.category,
        name: data.name, description: data.description, quantity: data.quantity, unit: data.unit,
        unitPrice: data.unitPrice, totalPrice, currency: data.currency || 'TRY',
        expectedAt: data.expectedAt ? new Date(data.expectedAt) : undefined, notes: data.notes,
      },
      include: { contact: { select: { id: true, name: true } } },
    });
    await this.timelineService.createEvent({ orderId: data.orderId, userId, eventType: 'PROCUREMENT', title: `Tedarik eklendi: ${data.name}` });
    return item;
  }

  async updateItem(id: string, data: any, userId: string) {
    const item = await this.prisma.procurementItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Tedarik kalemi bulunamadı.');
    const updateData: any = { ...data };
    if (data.status === 'RECEIVED') { updateData.receivedAt = new Date(); }
    if (data.status === 'ORDERED') { updateData.orderedAt = new Date(); }
    if (data.expectedAt) updateData.expectedAt = new Date(data.expectedAt);
    const updated = await this.prisma.procurementItem.update({ where: { id }, data: updateData, include: { contact: { select: { id: true, name: true } } } });
    await this.timelineService.createEvent({ orderId: item.orderId, userId, eventType: 'PROCUREMENT', title: `Tedarik güncellendi: ${item.name} → ${data.status || 'bilgi'}` });
    return updated;
  }

  async removeItem(id: string) {
    const item = await this.prisma.procurementItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Tedarik kalemi bulunamadı.');
    await this.prisma.procurementItem.delete({ where: { id } });
    return { message: 'Tedarik kalemi silindi.' };
  }

  async getOrderItems(orderId: string) {
    return this.prisma.procurementItem.findMany({
      where: { orderId }, include: { contact: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' },
    });
  }
}
