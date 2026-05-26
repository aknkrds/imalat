import { Module } from '@nestjs/common';
import { IroningPackingService } from './ironing-packing.service';
import { IroningPackingController } from './ironing-packing.controller';
import { TimelineModule } from '../timeline/timeline.module';
@Module({ imports: [TimelineModule], controllers: [IroningPackingController], providers: [IroningPackingService], exports: [IroningPackingService] })
export class IroningPackingModule {}
