import { Module } from '@nestjs/common';
import { ProductionService } from './production.service';
import { ProductionController } from './production.controller';
import { TimelineModule } from '../timeline/timeline.module';
@Module({ imports: [TimelineModule], controllers: [ProductionController], providers: [ProductionService], exports: [ProductionService] })
export class ProductionModule {}
