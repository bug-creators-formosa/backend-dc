import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportTypesModule } from './report-types/report-types.module';
import { ReportType } from './report-types/entities/report-type.entity';
import { ImagesModule } from '@/images/images.module';
import { Image } from '@/images/entities/image.entity';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    ImagesModule,
    TypeOrmModule.forFeature([Image, Report, ReportType]),
    ReportTypesModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
