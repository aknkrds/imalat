import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PaginationParams, PaginatedResult } from '../../common/interfaces';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContactDto, organizationId: string) {
    const contact = await this.prisma.contact.create({
      data: {
        organizationId,
        ...dto,
      },
    });

    // Otomatik cari hesap oluştur
    await this.prisma.account.create({
      data: {
        organizationId,
        contactId: contact.id,
        name: contact.name,
        type: contact.type, // CUSTOMER veya SUPPLIER
        currency: 'TRY',
      },
    });

    return contact;
  }

  async findAll(organizationId: string, params: PaginationParams & { type?: string }): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, search, sortBy = 'name', sortOrder = 'asc', type } = params as any;
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId,
      deletedAt: null,
    };

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: { select: { orders: true, procurementItems: true } },
          accounts: {
            select: { id: true, balance: true, currency: true },
          },
        },
      }),
      this.prisma.contact.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
  }

  async findOne(id: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      include: {
        accounts: true,
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: { id: true, orderNumber: true, productName: true, currentState: true, createdAt: true },
        },
        _count: { select: { orders: true, procurementItems: true } },
      },
    });

    if (!contact) {
      throw new NotFoundException('Kayıt bulunamadı.');
    }

    return contact;
  }

  async update(id: string, dto: UpdateContactDto) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) {
      throw new NotFoundException('Kayıt bulunamadı.');
    }

    return this.prisma.contact.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) {
      throw new NotFoundException('Kayıt bulunamadı.');
    }

    await this.prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { message: 'Kayıt silindi.' };
  }
}
