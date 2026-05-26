import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(organizationId: string) {
    const [totalOrders, activeOrders, completedOrders, cancelledOrders, openIssues, totalContacts] = await Promise.all([
      this.prisma.order.count({ where: { organizationId, deletedAt: null } }),
      this.prisma.order.count({ where: { organizationId, deletedAt: null, completedAt: null, cancelledAt: null } }),
      this.prisma.order.count({ where: { organizationId, completedAt: { not: null } } }),
      this.prisma.order.count({ where: { organizationId, cancelledAt: { not: null } } }),
      this.prisma.issue.count({ where: { order: { organizationId }, status: { in: ['OPEN', 'IN_PROGRESS'] }, deletedAt: null } }),
      this.prisma.contact.count({ where: { organizationId, deletedAt: null } }),
    ]);

    // Durum dağılımı
    const ordersByState = await this.prisma.order.groupBy({
      by: ['currentStateId'],
      where: { organizationId, deletedAt: null },
      _count: true,
    });

    // Son siparişler
    const recentOrders = await this.prisma.order.findMany({
      where: { organizationId, deletedAt: null },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        currentState: true,
        contact: { select: { name: true } },
      },
    });

    // Geciken siparişler
    const delayedOrders = await this.prisma.order.findMany({
      where: { organizationId, deletedAt: null, deadline: { lt: new Date() }, completedAt: null, cancelledAt: null },
      include: { currentState: true, contact: { select: { name: true } } },
      orderBy: { deadline: 'asc' },
    });

    return {
      stats: { totalOrders, activeOrders, completedOrders, cancelledOrders, openIssues, totalContacts },
      ordersByState,
      recentOrders,
      delayedOrders,
    };
  }
}
