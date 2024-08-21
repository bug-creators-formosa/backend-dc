import { ROLES, ROLE_NAMES } from '@/auth/consts';
import { Role } from '@/auth/entities/role.entity';
import { ENVIRONMENT } from '@/config/env';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

/**
 * Service responsible for handling user-related operations.
 * 
 * @internal
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    private configService: ConfigService
  ) { }

  get saltRounds(): number {
    const saltRounds = this.configService.get<ENVIRONMENT['SALT_ROUNDS']>('SALT_ROUNDS');
    if (!saltRounds) {
      return 10;
    }
    return parseInt(saltRounds);
  }

  async defaultRole(): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { name: ROLES.USER } });
    if (!role) {
      console.warn("Role de usuario no encontrado. Asegúrese de que la base de datos se haya inicializado correctamente.");
      throw new NotFoundException("Role not found");
    }
    return role;
  }

  async create(user: CreateUserDto) {
    const found = await this.usersRepository.findOne({
      where: [{ name: user.name }, { email: user.email }],
    });

    if (found) {
      throw new ConflictException("User or email already exists");
    }

    const userInstance = this.usersRepository.create({
      ...user,
      roles: [await this.defaultRole()],
    });
    userInstance.password = await bcrypt.hash(user.password, this.saltRounds);
    await this.usersRepository.save(userInstance);
    return userInstance;
  }

  async update(user_id: string, user: Partial<User>) {
    const found = await this.usersRepository.findOne({ where: { user_id } });
    if (!found) {
      throw new NotFoundException("User not found");
    }

    let password = user.password;
    if (password) {
      password = await bcrypt.hash(password, this.saltRounds);
    }

    const userInstance = this.usersRepository.merge(found, user);
    userInstance.password = password as string;
    await this.usersRepository.save(userInstance);

    return userInstance;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email }, relations: ['roles'] });
  }

  async findOneByName(name: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { name }, relations: ['roles'] });
  }

  async findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { user_id: id },
      relations: ['roles'],
    });
  }

  async findAll(options?: {
    query?: string;
    filter?: {
      role: (typeof ROLE_NAMES)[number];
    };
    orderBy?: 'createdAt' | 'username';
  }): Promise<User[]> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles');

    if (options?.query) {
      query.andWhere(
        `(
          user.name LIKE :query
        )`,
        { query: `%${options.query}%` },
      );
    }

    if (options?.filter && options.filter.role) {
      query.andWhere(`
        :role IN (
            SELECT roles.name FROM user_roles JOIN roles ON user_roles.role_id = roles.role_id 
            WHERE user_roles.user_id = "user".user_id
         )
      `, { role: options.filter.role });
    }

    if (options?.orderBy && options.orderBy == 'createdAt') {
      query.orderBy('user.created_at', 'DESC');
    } else if (options?.orderBy && options.orderBy == 'username') {
      query.orderBy('user.name', 'ASC');
    }

    const users = await query.getMany();
    return users;
  }

  async findUserCountByMonth() {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .select('COUNT(user.user_id)', 'users')
      .addSelect('DATE_TRUNC(\'month\', user.created_at)', 'month_date')
      .addSelect('EXTRACT(YEAR FROM DATE_TRUNC(\'month\', user.created_at))', 'year')
      .addSelect('EXTRACT(MONTH FROM DATE_TRUNC(\'month\', user.created_at))', 'month')
      .groupBy('month_date')
      .orderBy('month_date', 'ASC');

    const result = await query.getRawMany();
    return result;
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Returns a user matching the given username and password if found. 
   * Otherwise, returns null.
   * 
   * @param user 
   * @param username 
   * @param password 
   */
  async matching(username: string, password: string): Promise<User | null> {
    const found = await this.findOneByName(username);
    if (!found) {
      return null;
    }
    const matches = await this.comparePassword(password, found.password);

    if (!matches) {
      return null;
    }
    return found;
  }


  async assignRole(user: User, roles: Role[]) {
    user.roles = roles;
    await this.usersRepository.save(user);
  }

  async removeRole(user: User, role: Role) {
    user.roles = user.roles.filter((r) => r.name !== role.name);
    await this.usersRepository.save(user);
  }
}
