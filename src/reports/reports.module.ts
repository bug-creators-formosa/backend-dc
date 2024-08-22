import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportTypesModule } from './report-types/report-types.module';
import { ReportType } from './report-types/entities/report-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, ReportType]), ReportTypesModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
