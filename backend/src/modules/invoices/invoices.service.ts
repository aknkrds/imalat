import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);
  constructor(private readonly prisma: PrismaService, private readonly timelineService: TimelineService) {}

  async create(data: {
    organizationId: string; orderId?: string; accountId?: string; type: string;
    invoiceNo: string; invoiceDate: string; subtotal: number;
    vatRate: number; vatAmount: number; totalAmount: number;
    currency?: string; description?: string; category?: string; notes?: string;
  }, userId: string) {
    const invoice = await this.prisma.invoice.create({
      data: {
        ...data,
        invoiceDate: new Date(data.invoiceDate),
        currency: data.currency || 'TRY',
      },
    });

    // Cari hesaba transaction ekle
    if (data.accountId) {
      const direction = data.type === 'PURCHASE' ? 'DEBIT' : 'CREDIT';
      await this.prisma.accountTransaction.create({
        data: {
          accountId: data.accountId,
          type: 'INVOICE',
          direction,
          amount: data.totalAmount,
          currency: data.currency || 'TRY',
          description: `Fatura: ${data.invoiceNo}`,
          referenceNo: data.invoiceNo,
          date: new Date(data.invoiceDate),
        },
      });

      // Bakiye güncelle
      await this.recalculateBalance(data.accountId);
    }

    if (data.orderId) {
      await this.timelineService.createEvent({
        orderId: data.orderId, userId, eventType: 'INVOICE',
        title: `${data.type === 'PURCHASE' ? 'Alım' : 'Satış'} faturası girildi: ${data.invoiceNo}`,
      });
    }

    return invoice;
  }

  async findAll(organizationId: string, params: { type?: string; orderId?: string; page?: number; limit?: number }) {
    const { page = 1, limit = 20, type, orderId } = params;
    const where: any = { organizationId, deletedAt: null };
    if (type) where.type = type;
    if (orderId) where.orderId = orderId;

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { invoiceDate: 'desc' },
        include: { order: { select: { id: true, orderNumber: true, productName: true } }, account: { select: { id: true, name: true, type: true } } },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { order: true, account: true },
    });
    if (!invoice) throw new NotFoundException('Fatura bulunamadı.');
    return invoice;
  }

  async remove(id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException('Fatura bulunamadı.');
    await this.prisma.invoice.update({ where: { id }, data: { deletedAt: new Date() } });
    if (invoice.accountId) await this.recalculateBalance(invoice.accountId);
    return { message: 'Fatura silindi.' };
  }

  private async recalculateBalance(accountId: string) {
    const transactions = await this.prisma.accountTransaction.findMany({ where: { accountId } });
    const balance = transactions.reduce((sum, t) => {
      return t.direction === 'DEBIT' ? sum + Number(t.amount) : sum - Number(t.amount);
    }, 0);
    await this.prisma.account.update({ where: { id: accountId }, data: { balance } });
  }
}
