import { Logger, Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getConnectionOptions } from '../config';
import { ENVIRONMENT } from '@/config/env';
import configEnv from '@/config/env';
import { Role } from '@/auth/entities/role.entity';
import { User } from '@/users/entities/user.entity';

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
          entities: [Role, User]
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [Logger, SeederService],
  exports: [],
})
export class SeederModule {}
