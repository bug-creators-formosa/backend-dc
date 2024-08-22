import { Role } from '@/auth/entities/role.entity';
import configEnv, { ENVIRONMENT } from '@/config/env';
import { ReportType } from '@/reports/entities/report-type.entity';
import { User } from '@/users/entities/user.entity';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnectionOptions } from '../config';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      load: [configEnv],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const dbConfig = config.get<ENVIRONMENT['DB']>('DB');
        if (!dbConfig) {
          throw new Error("DB configuration not found");
        }
        return {
          ...getConnectionOptions(dbConfig),
          entities: [Role, User, ReportType]
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [Logger, SeederService],
  exports: [],
})
export class SeederModule { }
