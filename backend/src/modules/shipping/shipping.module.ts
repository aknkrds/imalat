import { Module } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { TimelineModule } from '../timeline/timeline.module';
@Module({ imports: [TimelineModule], controllers: [ShippingController], providers: [ShippingService], exports: [ShippingService] })
export class ShippingModule {}
