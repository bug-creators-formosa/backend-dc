import { User } from '@/users/entities/user.entity';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REPORT_STATES, ReportState } from './consts/report.states';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportType } from './report-types/entities/report-type.entity';
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
      throw new InternalServerErrorException("Error al crear el reporte");
    }

    return { report: created, message: "Denuncia creada con éxito" };
  }

  async findByAuthor(author: User) {
    const found = await this.reportsRepository.find({
      where: { user: { user_id: author.user_id } }
    });
    return found
  }

  async findAll(options: {
    state?: ReportState,
    query?: string
  }) {
    const query = this.reportsRepository.createQueryBuilder('report');

    if (options.query) {
      query.where(`
          report.title ILIKE :query OR
          report.description ILIKE :query
      `, { query: `%${options.query}%` });
    }

    if (options.state) {
      query.andWhere(`
          report.state = :state 
      `, { state: options.state });
    }

    const found = await query.getMany();
    return found;
  }

  async findAllOpened() {
    return this.reportsRepository.find({
      where: {
        type: { name: REPORT_STATES.OPENED }
      }
    });
  }

  async closeReport(report_id: string) {
    const report = await this.reportsRepository.findOne({
      where: { report_id }
    });
    if (!report) {
      throw new NotFoundException("Denuncia no encontrada");
    }
    const merged = this.reportsRepository.merge(report, {
      state: REPORT_STATES.CLOSED
    });
    await this.reportsRepository.save(merged);
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

  async update(id: string, updateReportDto: UpdateReportDto) {
    const found = await this.reportsRepository.findOne({
      where: { report_id: id }
    });

    if (!found) {
      throw new NotFoundException("Denuncia no encontrada");
    }

    if (updateReportDto.report_type_id) {
      const reportType = await this.reportTypeRepository.findOne({
        where: { report_type_id: updateReportDto.report_type_id }
      });

      if (!reportType) {
        throw new NotFoundException("Tipo de denuncia no encontrada");
      }
      found.type = reportType;
    }

    const updated = this.reportsRepository.merge(found, updateReportDto);
    await this.reportsRepository.save(updated);

    return {
      report: updated,
      message: "Denuncia actualizada con éxito"
    }
  }

  async remove(id: string, user: User) {
    const result = await this.reportsRepository.softDelete({ report_id: id, user: { user_id: user.user_id } });

    if (result.affected === 0) {
      throw new NotFoundException("Denuncia no encontrada");
    }

    return true;
  }
}
