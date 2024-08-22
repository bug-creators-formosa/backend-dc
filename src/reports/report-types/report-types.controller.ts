import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ReportTypesService } from './report-types.service';
import { CreateReportTypeDto } from './dto/create-report-type.dto';
import { UpdateReportTypeDto } from './dto/update-report-type.dto';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { RoleGuard } from '@/auth/guards/role.guard';
import { Role } from '@/auth/decorators/role.decorator';
import { ROLES } from '@/auth/consts';

@Controller('report-types')
@UseGuards(RoleGuard)
@UseGuards(JwtAuthGuard)
export class ReportTypesController {
  constructor(private readonly reportTypesService: ReportTypesService) {}

  @Role(ROLES.ADMIN)
  @Post()
  create(@Body() createReportTypeDto: CreateReportTypeDto) {
    return this.reportTypesService.create(createReportTypeDto);
  }

  @Get()
  findAll() {
    return this.reportTypesService.findAll();
  }

  @Role(ROLES.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportTypesService.findOne(id);
  }

  @Role(ROLES.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReportTypeDto: UpdateReportTypeDto,
  ) {
    return this.reportTypesService.update(id, updateReportTypeDto);
  }

  @Role(ROLES.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportTypesService.remove(id);
  }
}
