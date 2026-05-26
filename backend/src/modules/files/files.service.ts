import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService) {}

  async createFileRecord(data: {
    orderId?: string; issueId?: string; uploadedById: string;
    fileName: string; originalName: string; mimeType: string; size: number;
    bucket: string; key: string; url?: string; category?: string;
  }) {
    return this.prisma.fileAttachment.create({ data });
  }

  async getOrderFiles(orderId: string) {
    return this.prisma.fileAttachment.findMany({
      where: { orderId, deletedAt: null }, orderBy: { createdAt: 'desc' },
    });
  }

  async getIssueFiles(issueId: string) {
    return this.prisma.fileAttachment.findMany({
      where: { issueId, deletedAt: null }, orderBy: { createdAt: 'desc' },
    });
  }

  async deleteFile(id: string) {
    await this.prisma.fileAttachment.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Dosya silindi.' };
  }

  generateFileKey(originalName: string): string {
    const ext = originalName.split('.').pop();
    return `${uuidv4()}.${ext}`;
  }
}
