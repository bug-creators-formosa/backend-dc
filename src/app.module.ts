import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configEnv, { ENVIRONMENT } from './config/env';
import { getConnectionOptions } from './database/config';
import { SeederModule } from './database/seeder/seeder.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      load: [configEnv],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<ENVIRONMENT['DB']>('DB');
        if (!dbConfig) throw new Error('DB configuration not found');
        return getConnectionOptions(dbConfig);
      },
      inject: [ConfigService],
    }),
    SeederModule,
    AuthModule,
    UsersModule,
    ProjectsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}