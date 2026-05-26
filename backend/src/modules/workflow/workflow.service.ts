import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  async getStates() {
    return this.prisma.workflowState.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getTransitionDefs() {
    return this.prisma.workflowTransitionDef.findMany({
      include: {
        fromState: true,
        toState: true,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
