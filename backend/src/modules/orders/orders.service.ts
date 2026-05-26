import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtPayload, PaginationParams, PaginatedResult } from '../../common/interfaces';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly timelineService: TimelineService,
  ) {}

  /**
   * Sipariş numarası oluştur — SIP-2026-00001
   */
  private async generateOrderNumber(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.order.count({
      where: {
        organizationId,
        orderNumber: { startsWith: `SIP-${year}` },
      },
    });
    const seq = String(count + 1).padStart(5, '0');
    return `SIP-${year}-${seq}`;
  }

  /**
   * Yeni sipariş oluştur
   */
  async create(dto: CreateOrderDto, user: JwtPayload) {
    // İlk workflow state'i bul (ORDER_ENTRY)
    const initialState = await this.prisma.workflowState.findUnique({
      where: { code: 'ORDER_ENTRY' },
    });

    if (!initialState) {
      throw new Error('Workflow başlangıç durumu bulunamadı. Lütfen seed çalıştırın.');
    }

    const orderNumber = await this.generateOrderNumber(user.organizationId);

    // İhracat ise KDV %0
    const vatRate = dto.marketType === 'EXPORT' ? 0 : (dto.vatRate || 10);

    const order = await this.prisma.order.create({
      data: {
        organizationId: user.organizationId,
        orderNumber,
        currentStateId: initialState.id,
        createdById: user.sub,
        contactId: dto.contactId,
        productName: dto.productName,
        productCode: dto.productCode,
        description: dto.description,
        quantity: dto.quantity,
        unit: dto.unit || 'adet',
        colors: dto.colors,
        sizes: dto.sizes,
        fabricType: dto.fabricType,
        fabricComposition: dto.fabricComposition,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        priority: dto.priority || 2,
        marketType: dto.marketType || 'DOMESTIC',
        vatRate,
        currency: dto.currency || 'TRY',
      },
      include: {
        currentState: true,
        contact: { select: { id: true, name: true, type: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Timeline
    await this.timelineService.createEvent({
      orderId: order.id,
      userId: user.sub,
      eventType: 'STATE_CHANGE',
      title: 'Sipariş oluşturuldu',
      description: `${order.orderNumber} numaralı sipariş oluşturuldu.`,
      metadata: { orderNumber: order.orderNumber },
    });

    return order;
  }

  /**
   * Sipariş listesi (rol bazlı filtreleme ile)
   */
  async findAll(
    user: JwtPayload,
    params: PaginationParams & { stateCode?: string; contactId?: string; marketType?: string },
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: user.organizationId,
      deletedAt: null,
    };

    // Atölye kullanıcıları sadece atanan siparişleri görür
    const workshopRoles = ['CUTTING', 'PRODUCTION', 'IRONING_PACKING', 'QUALITY_CONTROL', 'SHIPPING'];
    const isWorkshopUser = user.roles.some((r) => workshopRoles.includes(r)) &&
      !user.roles.includes('SUPER_ADMIN') &&
      !user.roles.includes('ADMIN') &&
      !user.roles.includes('OPERATION');

    if (isWorkshopUser) {
      where.assignments = {
        some: { userId: user.sub },
      };
    }

    if ((params as any).stateCode) {
      where.currentState = { code: (params as any).stateCode };
    }

    if ((params as any).contactId) {
      where.contactId = (params as any).contactId;
    }

    if ((params as any).marketType) {
      where.marketType = (params as any).marketType;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { productName: { contains: search, mode: 'insensitive' } },
        { productCode: { contains: search, mode: 'insensitive' } },
        { contact: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          currentState: true,
          contact: { select: { id: true, name: true, type: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { issues: true, files: true, comments: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
  }

  /**
   * Sipariş detay
   */
  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        currentState: true,
        contact: true,
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignments: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        costItems: { orderBy: { sortOrder: 'asc' } },
        pricingItems: { orderBy: { sortOrder: 'asc' } },
        sampleRecords: { orderBy: { createdAt: 'desc' } },
        sampleCritiques: { orderBy: { createdAt: 'desc' } },
        patternInfo: true,
        measurementSets: {
          include: { entries: true },
          orderBy: { sortOrder: 'asc' },
        },
        procurementItems: {
          include: { contact: { select: { id: true, name: true } } },
        },
        cuttingRecords: true,
        productionRecords: true,
        ironingPackingRecords: true,
        shippingRecords: true,
        invoices: true,
        issues: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
        files: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { comments: true, timelineEvents: true, issues: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı.');
    }

    return order;
  }

  /**
   * Sipariş güncelle
   */
  async update(id: string, dto: UpdateOrderDto, user: JwtPayload) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı.');
    }

    // İhracat ise KDV %0
    const updateData: any = { ...dto };
    if (dto.marketType === 'EXPORT') {
      updateData.vatRate = 0;
    }
    if (dto.deadline) {
      updateData.deadline = new Date(dto.deadline);
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        currentState: true,
        contact: { select: { id: true, name: true, type: true } },
      },
    });

    await this.timelineService.createEvent({
      orderId: id,
      userId: user.sub,
      eventType: 'COMMENT',
      title: 'Sipariş bilgileri güncellendi',
    });

    return updated;
  }

  /**
   * Soft delete
   */
  async remove(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı.');
    }

    await this.prisma.order.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { message: 'Sipariş silindi.' };
  }
}
