import { ROLES } from '@/auth/consts';
import { Role } from '@/auth/decorators/role.decorator';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { RoleGuard } from '@/auth/guards/role.guard';
import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ALLOWED_REPORT_STATES, ReportState } from './consts/report.states';
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
  findAll(
    @Query('q') query: string,
    @Query('state') state: string
  ) {
    if (state && !ALLOWED_REPORT_STATES.includes(state as ReportState)) {
      throw new NotFoundException('Estado de denuncia desconocido');
    }
    return this.reportsService.findAll({
      query,
      state: state as ReportState
    });
  }

  @Role(ROLES.ADMIN)
  @Get('/opened')
  findAllOpened() {
    return this.reportsService.findAllOpened();
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

  @Role(ROLES.ADMIN)
  @Patch(':id/close')
  async closeReport(
    @Param('id') report_id: string
  ) {
    return this.reportsService.closeReport(report_id);
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
