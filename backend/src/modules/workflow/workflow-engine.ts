import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';
import { JwtPayload } from '../../common/interfaces';

export interface TransitionPayload {
  note?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class WorkflowEngine {
  private readonly logger = new Logger(WorkflowEngine.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly timelineService: TimelineService,
  ) {}

  /**
   * Bir siparişin mevcut durumundan yapılabilecek geçişleri döndür
   */
  async getAvailableTransitions(orderId: string, userRoles: string[]) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { currentState: true },
    });

    if (!order) {
      throw new BadRequestException('Sipariş bulunamadı.');
    }

    const transitions = await this.prisma.workflowTransitionDef.findMany({
      where: { fromStateId: order.currentStateId },
      include: {
        toState: true,
        fromState: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    // SUPER_ADMIN ve ADMIN tüm geçişleri yapabilir
    if (userRoles.includes('SUPER_ADMIN') || userRoles.includes('ADMIN')) {
      return transitions;
    }

    // Diğer kullanıcılar sadece yetkili oldukları geçişleri görebilir
    return transitions.filter((t) =>
      t.requiredRoles.length === 0 ||
      t.requiredRoles.some((role) => userRoles.includes(role)),
    );
  }

  /**
   * Geçiş yapılabilir mi kontrolü
   */
  async canTransition(
    orderId: string,
    toStateCode: string,
    userRoles: string[],
  ): Promise<{ allowed: boolean; reason?: string }> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { currentState: true },
    });

    if (!order) {
      return { allowed: false, reason: 'Sipariş bulunamadı.' };
    }

    const toState = await this.prisma.workflowState.findUnique({
      where: { code: toStateCode },
    });

    if (!toState) {
      return { allowed: false, reason: 'Hedef durum bulunamadı.' };
    }

    const transitionDef = await this.prisma.workflowTransitionDef.findUnique({
      where: {
        fromStateId_toStateId: {
          fromStateId: order.currentStateId,
          toStateId: toState.id,
        },
      },
    });

    if (!transitionDef) {
      return {
        allowed: false,
        reason: `"${order.currentState.name}" durumundan "${toState.name}" durumuna geçiş tanımlı değil.`,
      };
    }

    // Rol kontrolü
    if (
      transitionDef.requiredRoles.length > 0 &&
      !userRoles.includes('SUPER_ADMIN') &&
      !userRoles.includes('ADMIN')
    ) {
      const hasRequiredRole = transitionDef.requiredRoles.some((role) =>
        userRoles.includes(role),
      );
      if (!hasRequiredRole) {
        return {
          allowed: false,
          reason: 'Bu geçiş için gerekli role sahip değilsiniz.',
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Workflow geçişini çalıştır
   * Transaction içinde: state güncelle → log yaz → timeline event oluştur
   */
  async executeTransition(
    orderId: string,
    toStateCode: string,
    user: JwtPayload,
    payload?: TransitionPayload,
  ) {
    // Kontrol
    const check = await this.canTransition(orderId, toStateCode, user.roles);
    if (!check.allowed) {
      throw new ForbiddenException(check.reason);
    }

    const toState = await this.prisma.workflowState.findUnique({
      where: { code: toStateCode },
    });

    if (!toState) {
      throw new BadRequestException('Hedef durum bulunamadı.');
    }

    // Transaction ile durumu güncelle
    const result = await this.prisma.$transaction(async (tx) => {
      // Mevcut sipariş
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { currentState: true },
      });

      if (!order) {
        throw new BadRequestException('Sipariş bulunamadı.');
      }

      const fromStateCode = order.currentState.code;

      // 1. Sipariş durumunu güncelle
      const updateData: any = {
        currentStateId: toState.id,
      };

      // Final state kontrolü
      if (toState.isFinal && toState.code === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
      if (toState.code === 'CANCELLED') {
        updateData.cancelledAt = new Date();
        updateData.cancelReason = payload?.note || null;
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: updateData,
        include: { currentState: true },
      });

      // 2. Geçiş log kaydı
      await tx.workflowTransition.create({
        data: {
          orderId,
          fromStateCode,
          toStateCode,
          performedById: user.sub,
          note: payload?.note,
          metadata: payload?.metadata || {},
        },
      });

      // 3. Timeline event
      await tx.timelineEvent.create({
        data: {
          orderId,
          userId: user.sub,
          eventType: 'STATE_CHANGE',
          title: `Durum değişti: ${order.currentState.name} → ${toState.name}`,
          description: payload?.note,
          metadata: {
            fromState: fromStateCode,
            toState: toStateCode,
            fromStateName: order.currentState.name,
            toStateName: toState.name,
          },
        },
      });

      return updatedOrder;
    });

    this.logger.log(
      `Workflow transition: Order ${orderId} → ${toStateCode} by ${user.email}`,
    );

    return result;
  }
}
