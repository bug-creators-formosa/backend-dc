import { ROLES } from '@/auth/consts';
import { Role } from '@/auth/decorators/role.decorator';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { RoleGuard } from '@/auth/guards/role.guard';
import { Body, Controller, Delete, Get, NotFoundException, Param, ParseUUIDPipe, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ALLOWED_REPORT_STATES, ReportState } from './consts/report.states';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(RoleGuard)
@UseGuards(JwtAuthGuard)
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
    @Query('q') query?: string,
    @Query('state') state?: string,
    @Query('type_id', new ParseUUIDPipe({
      optional: true,
      exceptionFactory: () => new NotFoundException('El ID de tipo debe ser un UUID válido')
    })) type_id?: string
  ) {
    if (state && !ALLOWED_REPORT_STATES.includes(state as ReportState)) {
      throw new NotFoundException('Estado de denuncia desconocido');
    }
    return this.reportsService.findAll({
      query,
      state: state as ReportState,
      type_id
    });
  }

  @Role(ROLES.ADMIN)
  @Get('/opened')
  findAllOpened() {
    return this.reportsService.findAllOpened();
  }

  @Get("/types")
  findAllTypes() {
    return this.reportsService.findAllTypes();
  }

  @Role(ROLES.ADMIN)
  @Get("/by-week")
  findCountByWeek() {
    return this.reportsService.findCountByWeek();
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
    return this.reportsService.updateUserReport(id, updateReportDto, user);
  }

  @Role(ROLES.ADMIN)
  @Patch(':id/close')
  async closeReport(
    @Param('id') report_id: string
  ) {
    return this.reportsService.closeReport(report_id);
  }

  @Role(ROLES.ADMIN)
  @Patch(':id/in-progress')
  async changeReportToProgress(
    @Param('id') report_id: string
  ) {
    return this.reportsService.changeReportToInProgress(report_id);
  }

  @Role(ROLES.ADMIN)
  @Patch(':id/solve')
  async solveReport(
    @Param('id') report_id: string
  ) {
    return this.reportsService.solveReport(report_id);
  }

  @Role(ROLES.ADMIN)
  @Patch(':id/open')
  async openReport(
    @Param('id') report_id: string
  ) {
    return this.reportsService.openReport(report_id);
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
