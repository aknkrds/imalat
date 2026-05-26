import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';
import { Decimal } from '@prisma/client/runtime/library';

export class CreateCostItemDto {
  orderId: string;
  category: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  currency?: string;
  notes?: string;
  sortOrder?: number;
}

export class UpdateCostItemDto {
  category?: string;
  name?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  currency?: string;
  notes?: string;
  sortOrder?: number;
}

@Injectable()
export class CostingService {
  private readonly logger = new Logger(CostingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly timelineService: TimelineService,
  ) {}

  /**
   * Maliyet kalemi ekle
   */
  async addCostItem(dto: CreateCostItemDto, userId: string) {
    const totalPrice = dto.quantity * dto.unitPrice;

    const item = await this.prisma.costItem.create({
      data: {
        orderId: dto.orderId,
        category: dto.category,
        name: dto.name,
        description: dto.description,
        quantity: dto.quantity,
        unit: dto.unit,
        unitPrice: dto.unitPrice,
        totalPrice,
        currency: dto.currency || 'TRY',
        notes: dto.notes,
        sortOrder: dto.sortOrder || 0,
      },
    });

    // Toplam maliyeti güncelle
    await this.recalculateOrderCost(dto.orderId);

    await this.timelineService.createEvent({
      orderId: dto.orderId,
      userId,
      eventType: 'COST_UPDATE',
      title: `Maliyet kalemi eklendi: ${dto.name}`,
      metadata: { category: dto.category, totalPrice },
    });

    return item;
  }

  /**
   * Maliyet kalemi güncelle
   */
  async updateCostItem(id: string, dto: UpdateCostItemDto, userId: string) {
    const item = await this.prisma.costItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Maliyet kalemi bulunamadı.');

    const quantity = dto.quantity ?? Number(item.quantity);
    const unitPrice = dto.unitPrice ?? Number(item.unitPrice);
    const totalPrice = quantity * unitPrice;

    const updated = await this.prisma.costItem.update({
      where: { id },
      data: {
        ...dto,
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
        totalPrice,
      },
    });

    await this.recalculateOrderCost(item.orderId);

    return updated;
  }

  /**
   * Maliyet kalemi sil
   */
  async removeCostItem(id: string, userId: string) {
    const item = await this.prisma.costItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Maliyet kalemi bulunamadı.');

    await this.prisma.costItem.delete({ where: { id } });
    await this.recalculateOrderCost(item.orderId);

    return { message: 'Maliyet kalemi silindi.' };
  }

  /**
   * Sipariş maliyet kalemlerini getir
   */
  async getOrderCostItems(orderId: string) {
    const items = await this.prisma.costItem.findMany({
      where: { orderId },
      orderBy: { sortOrder: 'asc' },
    });

    const totalCost = items.reduce((sum, item) => sum + Number(item.totalPrice), 0);
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { quantity: true },
    });
    const unitCost = order ? totalCost / order.quantity : 0;

    return {
      items,
      summary: {
        totalCost: Math.round(totalCost * 100) / 100,
        unitCost: Math.round(unitCost * 100) / 100,
        itemCount: items.length,
      },
    };
  }

  /**
   * Sipariş toplam maliyet güncelle
   */
  private async recalculateOrderCost(orderId: string) {
    const items = await this.prisma.costItem.findMany({ where: { orderId } });
    const totalCost = items.reduce((sum, item) => sum + Number(item.totalPrice), 0);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { quantity: true },
    });

    const unitCost = order ? totalCost / order.quantity : 0;

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        totalCost: Math.round(totalCost * 100) / 100,
        unitCost: Math.round(unitCost * 100) / 100,
      },
    });
  }
}
