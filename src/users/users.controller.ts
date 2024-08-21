import { ROLES } from '@/auth/consts';
import { Role } from '@/auth/decorators/role.decorator';
import { Role as RoleEntity } from '@/auth/entities/role.entity';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { RoleGuard } from '@/auth/guards/role.guard';
import { ProjectsService } from '@/projects/projects.service';
import { Body, Controller, Delete, Get, NotFoundException, Param, ParseUUIDPipe, Patch, Put, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { FindAllQueryDto } from './dto/find-all-query.dto';
import { RemoveRoleDto } from './dto/remove-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('/users')
@UseGuards(JwtAuthGuard)
@UseGuards(RoleGuard)
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly projectService: ProjectsService,
        @InjectRepository(RoleEntity) private readonly roleRepository: Repository<RoleEntity>,
    ) { }

    @Role(ROLES.ADMIN)
    @Get()
    async findAll(
        @Query() query: FindAllQueryDto,
    ) {
        return this.usersService.findAll({
            query: query.q,
            filter: {
                role: query.filter_role
            },
            orderBy: query.order_by
        });
    }

    @Role(ROLES.ADMIN)
    @Get("/by-month")
    async findByWeek() {
        return this.usersService.findUserCountByMonth();
    }

    @Role(ROLES.ADMIN)
    @Get(':id')
    async getById(
        @Param("id") user_id: string
    ) {
        return this.usersService.findOneById(user_id)
    }

    @Role(ROLES.ADMIN)
    @Patch(':id')
    async updateById(
        @Param("id", new ParseUUIDPipe()) user_id: string,
        @Body() updateUserDto: UpdateUserDto
    ) {
        return this.usersService.update(user_id, updateUserDto);
    }

    @Put(':user_id/roles')
    @Role(ROLES.ADMIN)
    async assignRoles(
        @Body() rolesDto: AssignRolesDto,
        @Param('user_id') user_id: string,
    ) {
        console.log(rolesDto);
        const roles: string[] = rolesDto.roles;
        const foundRoles = await this.roleRepository.find({
            where: roles.map((role) => ({ name: role })),
        });
        if (!foundRoles) {
            throw new NotFoundException('Role not found');
        }
        const user = await this.usersService.findOneById(user_id);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return this.usersService.assignRole(user, foundRoles);
    }

    @Delete(':user_id/role')
    @Role(ROLES.ADMIN)
    async removeRole(
        @Body() roleDto: RemoveRoleDto,
        @Param('user_id') user_id: string,
    ) {
        const role = roleDto.role_name;
        console.log(roleDto);
        const roleEntity = await this.roleRepository.findOne({
            where: { name: role },
        });
        if (!roleEntity) {
            throw new NotFoundException('Role not found');
        }
        const user = await this.usersService.findOneById(user_id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.usersService.removeRole(user, roleEntity);
    }


    @Get("/projects")
    async findProjects(
        @Req() req: Request
    ) {
        const user = req.user;
        if (!user) {
            throw new UnauthorizedException("Usuario no autenticado");
        }
        return this.projectService.findByAuthor(user);
    }
}
