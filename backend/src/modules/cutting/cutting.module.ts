// Cutting Module
import { Module } from '@nestjs/common';
import { CuttingService } from './cutting.service';
import { CuttingController } from './cutting.controller';
import { TimelineModule } from '../timeline/timeline.module';
@Module({ imports: [TimelineModule], controllers: [CuttingController], providers: [CuttingService], exports: [CuttingService] })
export class CuttingModule {}
