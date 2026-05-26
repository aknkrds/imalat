import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { WorkflowModule } from '../workflow/workflow.module';
import { TimelineModule } from '../timeline/timeline.module';

@Module({
  imports: [WorkflowModule, TimelineModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
