import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CostingModule } from './modules/costing/costing.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { SamplesModule } from './modules/samples/samples.module';
import { PatternsModule } from './modules/patterns/patterns.module';
import { ProcurementModule } from './modules/procurement/procurement.module';
import { CuttingModule } from './modules/cutting/cutting.module';
import { ProductionModule } from './modules/production/production.module';
import { IroningPackingModule } from './modules/ironing-packing/ironing-packing.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FilesModule } from './modules/files/files.module';
import { IssuesModule } from './modules/issues/issues.module';
import { AuditModule } from './modules/audit/audit.module';
import { QrcodeModule } from './modules/qrcode/qrcode.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Core
    PrismaModule,

    // Auth & Users
    AuthModule,
    UsersModule,
    RolesModule,

    // Workflow
    WorkflowModule,

    // Business modules
    ContactsModule,
    OrdersModule,
    CostingModule,
    PricingModule,
    SamplesModule,
    PatternsModule,
    ProcurementModule,
    CuttingModule,
    ProductionModule,
    IroningPackingModule,
    ShippingModule,
    InvoicesModule,
    AccountingModule,

    // Support modules
    TimelineModule,
    NotificationsModule,
    FilesModule,
    IssuesModule,
    AuditModule,
    QrcodeModule,
    ReportsModule,
  ],
})
export class AppModule {}
