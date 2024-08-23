import { ROLES } from '@/auth/consts';
import { Role } from '@/auth/entities/role.entity';
import { ENVIRONMENT } from '@/config/env';
import { REPORT_TYPES } from '@/reports/consts/report-types';
import { REPORT_STATES } from '@/reports/consts/report.states';
import { Report } from '@/reports/entities/report.entity';
import { ReportType } from '@/reports/report-types/entities/report-type.entity';
import { User } from '@/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as fs from 'node:fs/promises';
import { EntityManager } from 'typeorm';

@Injectable()
export class SeederService {
  constructor(
    private entityManager: EntityManager,
    private configService: ConfigService,
  ) {}

  /**
   * Apply all seeding operations
   */
  async seed() {
    await this.seedRoles();
    await this.seedDefaultAdmin();
    await this.seedUsers();
    await this.seedReportTypes();
    await this.seedReports();
  }

  get saltRounds(): number {
    const saltRounds =
      this.configService.get<ENVIRONMENT['SALT_ROUNDS']>('SALT_ROUNDS');
    if (!saltRounds) {
      return 10;
    }
    return parseInt(saltRounds);
  }

  async seedUsers() {
    const contents = await fs.readFile(
      'src/database/seeder/mock/users.json',
      'utf8',
    );
    const users = JSON.parse(contents) as User[];
    const roleRepository = this.entityManager.getRepository(Role);
    const userRepository = this.entityManager.getRepository(User);
    const userRole = await roleRepository.findOne({
      where: { name: ROLES.USER },
    });
    if (!userRole) {
      throw new Error('User role not found');
    }
    for (const user of users) {
      const userEntity = userRepository.create({
        ...user,
        password: await bcrypt.hash(user.password, this.saltRounds),
      });
      userEntity.roles = [userRole];
      await userRepository.save(userEntity);
    }
  }

  async seedReportTypes() {
    const repository = this.entityManager.getRepository(ReportType);
    // await repository.insert(REPORT_TYPES);
    const reportTypes = Object.values(REPORT_TYPES)
      .map((reportType) => {
        return repository.create({
          name: reportType.name,
          description: reportType.description,
        });
      })
      .map((reportType) => {
        return repository.upsert(reportType, {
          conflictPaths: {
            name: true,
          },
        });
      });
    await Promise.all(reportTypes);
  }

  async seedDefaultAdmin() {
    const roleRepository = this.entityManager.getRepository(Role);
    const adminRole = await roleRepository.findOne({
      where: { name: ROLES.ADMIN },
    });
    if (!adminRole) {
      throw new Error('Admin role not found');
    }
    const userRepository = this.entityManager.getRepository(User);
    const hasAdmin = await userRepository.findOne({
      where: {
        roles: [adminRole],
      },
    });
    if (hasAdmin) {
      return hasAdmin;
    }

    const admin = userRepository.create({
      names: 'Admin',
      surnames: 'Admin',
      username: 'admin',
      password: await bcrypt.hash('Password.1', this.saltRounds),
      email: 'admin@example.com',
    });
    admin.roles = [adminRole];

    return userRepository.save(admin);
  }

  /**
   * Seeds any roles on the consts file on auth module.
   * This is useful to ensure that the roles are always present on the database.
   * It performs an upsert operation, so to avoid duplicates.
   */
  async seedRoles(): Promise<void> {
    const roleRepository = this.entityManager.getRepository(Role);

    const roles = Object.values(ROLES)
      .map((roleName) => {
        return roleRepository.create({ name: roleName });
      })
      .map((role) => {
        return roleRepository.upsert(role, {
          conflictPaths: {
            name: true,
          },
        });
      });

    await Promise.all(roles);
  }

  async seedReports(): Promise<void> {
    const contents = await fs.readFile(
      'src/database/seeder/mock/reports.json',
      'utf8',
    );
    const mockReports = JSON.parse(contents) as Report[];
    const reportRepository = this.entityManager.getRepository(Report);
    const reportTypes = await this.entityManager
      .getRepository(ReportType)
      .find();
    const userRepository = this.entityManager.getRepository(User);

    const users = await userRepository.find();

    const randomState = Object.values(REPORT_STATES);

    for (const user of users) {
      const RANDOM_NUMBER_OF_REPORTS = Math.floor(Math.random() * 3) + 1;

      const reports = Array.from({ length: RANDOM_NUMBER_OF_REPORTS }).map(
        () => {
          const reportType =
            reportTypes[Math.floor(Math.random() * reportTypes.length)];
          const randomReport =
            mockReports[Math.floor(Math.random() * mockReports.length)];

          const countStates =
            Math.floor(Math.random() * randomState.length) + 1;

          return reportRepository.create({
            title: randomReport.title,
            description: randomReport.description,
            address: randomReport.address,
            type: reportType,
            user,
            created_at: randomReport.created_at,
            state: randomState[countStates],
            state_change_at: randomReport.created_at
          });
        },
      );

      await reportRepository.save(reports);
    }
  }
}
