import { Module } from '@nestjs/common';
import { ReportTypesService } from './report-types.service';
import { ReportTypesController } from './report-types.controller';
import { ReportType } from './entities/report-type.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from '../entities/report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, ReportType])],
  controllers: [ReportTypesController],
  providers: [ReportTypesService],
  exports: [ReportTypesService],
})
export class ReportTypesModule {}
