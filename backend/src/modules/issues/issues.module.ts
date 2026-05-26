import { Module } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { IssuesController } from './issues.controller';
import { TimelineModule } from '../timeline/timeline.module';
@Module({ imports: [TimelineModule], controllers: [IssuesController], providers: [IssuesService], exports: [IssuesService] })
export class IssuesModule {}
