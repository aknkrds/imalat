import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TimelineService {
  private readonly logger = new Logger(TimelineService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Timeline event oluştur
   */
  async createEvent(data: {
    orderId: string;
    userId: string;
    eventType: string;
    title: string;
    description?: string;
    metadata?: Record<string, any>;
  }) {
    return this.prisma.timelineEvent.create({
      data: {
        orderId: data.orderId,
        userId: data.userId,
        eventType: data.eventType,
        title: data.title,
        description: data.description,
        metadata: data.metadata || {},
      },
    });
  }

  /**
   * Sipariş timeline'ını getir
   */
  async getOrderTimeline(orderId: string, limit = 50) {
    return this.prisma.timelineEvent.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }
}
