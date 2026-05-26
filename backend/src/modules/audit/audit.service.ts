import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: { userId: string; action: string; entity: string; entityId: string; oldValue?: any; newValue?: any; ipAddress?: string; userAgent?: string }) {
    return this.prisma.auditLog.create({ data });
  }

  async getEntityLogs(entity: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: { entity, entityId }, orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async getUserLogs(userId: string, params: { page?: number; limit?: number }) {
    const { page = 1, limit = 50 } = params;
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { userId }, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { userId } }),
    ]);
    return { data, meta: { total, page, limit } };
  }

  async getRecentLogs(params: { page?: number; limit?: number }) {
    const { page = 1, limit = 50 } = params;
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
      }),
      this.prisma.auditLog.count(),
    ]);
    return { data, meta: { total, page, limit } };
  }
}
