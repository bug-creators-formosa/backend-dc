import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from '@/auth/entities/role.entity';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './users.controller';
import { ProjectsModule } from '@/projects/projects.module';
import { ProjectsService } from '@/projects/projects.service';
import { Project } from '@/projects/entities/project.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Role, Project]),
    ProjectsModule,
  ],
  providers: [UsersService, ProjectsService],
  exports: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
