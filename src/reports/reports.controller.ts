import { ROLES } from '@/auth/consts';
import { Role } from '@/auth/decorators/role.decorator';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { RoleGuard } from '@/auth/guards/role.guard';
import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
@UseGuards(RoleGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Post()
  create(
    @Body() createProjectDto: CreateReportDto,
    @Req() req: Request
  ) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException("Usuario no autenticado");
    }
    return this.reportsService.create(createProjectDto, user);
  }

  @Role(ROLES.ADMIN)
  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  @Get("/types")
  findAllTypes() {
    return this.reportsService.findAllTypes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
    @Req() req: Request
  ) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException("Usuario no autenticado");
    }
    return this.reportsService.update(id, updateReportDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: Request
  ) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException("Usuario no autenticado");
    }
    return this.reportsService.remove(id, user);
  }
}
