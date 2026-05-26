import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly timelineService: TimelineService,
  ) {}

  async addPricingItem(data: {
    orderId: string;
    category: string;
    name: string;
    description?: string;
    amount: number;
    isPercentage?: boolean;
    percentage?: number;
    currency?: string;
    sortOrder?: number;
  }, userId: string) {
    // Yüzde bazlı ise maliyet üzerinden hesapla
    let amount = data.amount;
    if (data.isPercentage && data.percentage) {
      const order = await this.prisma.order.findUnique({
        where: { id: data.orderId },
        select: { totalCost: true },
      });
      if (order?.totalCost) {
        amount = Number(order.totalCost) * (data.percentage / 100);
      }
    }

    const item = await this.prisma.pricingItem.create({
      data: {
        orderId: data.orderId,
        category: data.category,
        name: data.name,
        description: data.description,
        amount,
        isPercentage: data.isPercentage || false,
        percentage: data.percentage,
        currency: data.currency || 'TRY',
        sortOrder: data.sortOrder || 0,
      },
    });

    await this.recalculateOfferPrice(data.orderId);

    await this.timelineService.createEvent({
      orderId: data.orderId,
      userId,
      eventType: 'COST_UPDATE',
      title: `Fiyatlandırma kalemi eklendi: ${data.name}`,
    });

    return item;
  }

  async updatePricingItem(id: string, data: any, userId: string) {
    const item = await this.prisma.pricingItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Fiyatlandırma kalemi bulunamadı.');

    const updated = await this.prisma.pricingItem.update({
      where: { id },
      data,
    });

    await this.recalculateOfferPrice(item.orderId);
    return updated;
  }

  async removePricingItem(id: string, userId: string) {
    const item = await this.prisma.pricingItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Fiyatlandırma kalemi bulunamadı.');

    await this.prisma.pricingItem.delete({ where: { id } });
    await this.recalculateOfferPrice(item.orderId);
    return { message: 'Fiyatlandırma kalemi silindi.' };
  }

  async getOrderPricing(orderId: string) {
    const items = await this.prisma.pricingItem.findMany({
      where: { orderId },
      orderBy: { sortOrder: 'asc' },
    });

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { totalCost: true, quantity: true, currency: true, offerUnitPrice: true, offerTotalPrice: true, companyExpenses: true, profitAmount: true, profitMargin: true },
    });

    const totalCost = Number(order?.totalCost || 0);
    const totalExtras = items.reduce((sum, item) => sum + Number(item.amount), 0);
    const offerTotal = totalCost + totalExtras;
    const offerUnit = order ? offerTotal / order.quantity : 0;

    return {
      items,
      summary: {
        totalCost,
        totalExtras: Math.round(totalExtras * 100) / 100,
        offerTotalPrice: Math.round(offerTotal * 100) / 100,
        offerUnitPrice: Math.round(offerUnit * 10000) / 10000,
        quantity: order?.quantity || 0,
        currency: order?.currency || 'TRY',
      },
    };
  }

  private async recalculateOfferPrice(orderId: string) {
    const items = await this.prisma.pricingItem.findMany({ where: { orderId } });
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { totalCost: true, quantity: true },
    });

    const totalCost = Number(order?.totalCost || 0);
    const companyExpenses = items
      .filter(i => i.category === 'COMPANY_EXPENSE')
      .reduce((sum, i) => sum + Number(i.amount), 0);
    const profitAmount = items
      .filter(i => i.category === 'PROFIT_MARGIN')
      .reduce((sum, i) => sum + Number(i.amount), 0);
    const totalExtras = items.reduce((sum, i) => sum + Number(i.amount), 0);
    const offerTotal = totalCost + totalExtras;
    const offerUnit = order ? offerTotal / order.quantity : 0;
    const profitMargin = totalCost > 0 ? (profitAmount / totalCost) * 100 : 0;

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        companyExpenses: Math.round(companyExpenses * 100) / 100,
        profitAmount: Math.round(profitAmount * 100) / 100,
        profitMargin: Math.round(profitMargin * 100) / 100,
        offerUnitPrice: Math.round(offerUnit * 10000) / 10000,
        offerTotalPrice: Math.round(offerTotal * 100) / 100,
      },
    });
  }
}
