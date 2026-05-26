import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { userId: string; orderId?: string; type: string; title: string; body: string; metadata?: any }) {
    return this.prisma.notification.create({ data: { ...data, metadata: data.metadata || {} } });
  }

  async getUserNotifications(userId: string, params: { isRead?: boolean; page?: number; limit?: number }) {
    const { page = 1, limit = 20, isRead } = params;
    const where: any = { userId };
    if (isRead !== undefined) where.isRead = isRead;

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
        include: { order: { select: { id: true, orderNumber: true, productName: true } } },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { data, meta: { total, page, limit, unreadCount } };
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { isRead: true, readAt: new Date() } });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true, readAt: new Date() } });
    return { message: 'Tüm bildirimler okundu olarak işaretlendi.' };
  }

  // Toplu bildirim gönder (örn: workflow geçişinde ilgili kullanıcılara)
  async notifyUsers(userIds: string[], data: { orderId?: string; type: string; title: string; body: string }) {
    const notifications = userIds.map(userId => ({ userId, ...data, metadata: {} }));
    await this.prisma.notification.createMany({ data: notifications });
  }
}
