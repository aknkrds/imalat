import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AccountingService {
  private readonly logger = new Logger(AccountingService.name);
  constructor(private readonly prisma: PrismaService) {}

  // Cari hesap listesi — T: Tedarikçi, M: Müşteri prefix ile
  async getAccounts(organizationId: string, params: { type?: string; search?: string; page?: number; limit?: number }) {
    const { page = 1, limit = 20, type, search } = params;
    const where: any = { organizationId, deletedAt: null };
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contact: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.account.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { name: 'asc' },
        include: { contact: { select: { id: true, name: true, phone: true } }, _count: { select: { transactions: true, invoices: true } } },
      }),
      this.prisma.account.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // Cari hesap detay + işlemler
  async getAccountDetail(id: string) {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: {
        contact: true,
        transactions: { orderBy: { date: 'desc' }, take: 100 },
        invoices: { orderBy: { invoiceDate: 'desc' }, take: 50 },
      },
    });
    if (!account) throw new NotFoundException('Cari hesap bulunamadı.');
    return account;
  }

  // Ödeme / Tahsilat ekle
  async addTransaction(data: {
    accountId: string; type: string; direction: string; amount: number;
    currency?: string; description?: string; referenceNo?: string; date: string; notes?: string;
  }) {
    const tx = await this.prisma.accountTransaction.create({
      data: { ...data, date: new Date(data.date), currency: data.currency || 'TRY' },
    });
    await this.recalculateBalance(data.accountId);
    return tx;
  }

  // İşlem sil
  async removeTransaction(id: string) {
    const tx = await this.prisma.accountTransaction.findUnique({ where: { id } });
    if (!tx) throw new NotFoundException('İşlem bulunamadı.');
    await this.prisma.accountTransaction.delete({ where: { id } });
    await this.recalculateBalance(tx.accountId);
    return { message: 'İşlem silindi.' };
  }

  private async recalculateBalance(accountId: string) {
    const transactions = await this.prisma.accountTransaction.findMany({ where: { accountId } });
    const balance = transactions.reduce((sum, t) => {
      return t.direction === 'DEBIT' ? sum + Number(t.amount) : sum - Number(t.amount);
    }, 0);
    await this.prisma.account.update({ where: { id: accountId }, data: { balance: Math.round(balance * 100) / 100 } });
  }
}
