import { Role } from '@/auth/entities/role.entity';
import { ReportType } from '@/reports/report-types/entities/report-type.entity';
import { Report } from '@/reports/entities/report.entity';
import { ReportsModule } from '@/reports/reports.module';
import { ReportsService } from '@/reports/reports.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Role, Report, ReportType]),
    ReportsModule,
  ],
  providers: [UsersService, ReportsService],
  exports: [UsersService],
  controllers: [UsersController]
})
export class UsersModule { }
