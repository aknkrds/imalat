import { Module } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowEngine } from './workflow-engine';
import { WorkflowController } from './workflow.controller';
import { TimelineModule } from '../timeline/timeline.module';

@Module({
  imports: [TimelineModule],
  controllers: [WorkflowController],
  providers: [WorkflowService, WorkflowEngine],
  exports: [WorkflowService, WorkflowEngine],
})
export class WorkflowModule {}
