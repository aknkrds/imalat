import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';

@Injectable()
export class IssuesService {
  constructor(private readonly prisma: PrismaService, private readonly timelineService: TimelineService) {}

  async create(data: { orderId: string; title: string; description: string; category: string; priority?: number }, userId: string) {
    const issue = await this.prisma.issue.create({
      data: { ...data, reportedById: userId, priority: data.priority || 2 },
    });
    await this.timelineService.createEvent({ orderId: data.orderId, userId, eventType: 'ISSUE', title: `Sorun bildirildi: ${data.title}` });
    return issue;
  }

  async update(id: string, data: any, userId: string) {
    const issue = await this.prisma.issue.findUnique({ where: { id } });
    if (!issue) throw new NotFoundException('Sorun bulunamadı.');
    const updateData: any = { ...data };
    if (data.status === 'RESOLVED') { updateData.resolvedAt = new Date(); updateData.resolvedById = userId; }
    const updated = await this.prisma.issue.update({ where: { id }, data: updateData });
    await this.timelineService.createEvent({ orderId: issue.orderId, userId, eventType: 'ISSUE', title: `Sorun güncellendi: ${issue.title}` });
    return updated;
  }

  async getOrderIssues(orderId: string) {
    return this.prisma.issue.findMany({
      where: { orderId, deletedAt: null }, orderBy: { createdAt: 'desc' },
      include: { resolvedBy: { select: { id: true, firstName: true, lastName: true } }, files: { where: { deletedAt: null } }, _count: { select: { comments: true } } },
    });
  }

  async addComment(issueId: string, content: string, userId: string) {
    return this.prisma.issueComment.create({ data: { issueId, userId, content } });
  }

  async getComments(issueId: string) {
    return this.prisma.issueComment.findMany({
      where: { issueId }, orderBy: { createdAt: 'asc' },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });
  }
}
