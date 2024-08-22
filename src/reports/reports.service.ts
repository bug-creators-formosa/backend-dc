import { User } from '@/users/entities/user.entity';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REPORT_STATES } from './consts/report.states';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportType } from './entities/report-type.entity';
import { Report } from './entities/report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private reportsRepository: Repository<Report>,
    @InjectRepository(ReportType) private reportTypeRepository: Repository<ReportType>
  ) { }

  async create(
    createReportDto: CreateReportDto,
    author: User,
  ) {
    const reportType = await this.reportTypeRepository.find({
      where: { report_type_id: createReportDto.report_type_id }
    });

    if (!reportType) {
      throw new NotFoundException("Tipo de denuncia no encontrada");
    }

    const created = this.reportsRepository.create({
      title: createReportDto.title,
      description: createReportDto.description,
      state: REPORT_STATES.OPENED,
      user: author
    });

    await this.reportsRepository.save(created);

    if (!created) {
      throw new InternalServerErrorException("Error al crear proyecto");
    }

    return { project: created, message: "Denuncia creada con éxito" };
  }

  async findAllTypes() {
    return this.reportTypeRepository.find();
  }

  async findByAuthor(author: User) {
    const found = await this.reportsRepository.find({
      where: { user: { user_id: author.user_id } }
    });
    return found
  }

  async findAll() {
    const found = await this.reportsRepository.find();
    return found;
  }

  async findOne(id: string) {
    const found = await this.reportsRepository.findOneBy({
      report_id: id,
    });

    if (!found) {
      throw new NotFoundException("Denuncia no encontrado");
    }

    return found;
  }

  async update(id: string, updateProjectDto: UpdateReportDto) {
    const found = await this.reportsRepository.findOne({
      where: { report_id: id }
    });

    if (!found) {
      throw new NotFoundException("Denuncia no encontrada");
    }

    const updated = this.reportsRepository.merge(found, updateProjectDto);
    await this.reportsRepository.save(updated);

    return updated;
  }

  async remove(id: string, user: User) {
    const result = await this.reportsRepository.softDelete({ report_id: id, user: { user_id: user.user_id } });

    if (result.affected === 0) {
      throw new NotFoundException("Denuncia no encontrada");
    }

    return true;
  }
}
