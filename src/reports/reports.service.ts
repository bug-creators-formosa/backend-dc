import { User } from '@/users/entities/user.entity';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REPORT_STATES, ReportState } from './consts/report.states';
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
    const reportType = await this.reportTypeRepository.findOne({
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

    created.type = reportType;

    await this.reportsRepository.save(created);

    if (!created) {
      throw new InternalServerErrorException("Error al crear proyecto");
    }


    return { report: created, message: "Denuncia creada con éxito" };
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

  async findAll(options: {
    state?: ReportState,
    query?: string,
    type_id?: string
  }) {
    const query = this.reportsRepository.createQueryBuilder('report')
      .leftJoinAndSelect('report.type', 'type');

    if (options.query) {
      query.where(`(
          report.title ILIKE :query OR
          report.description ILIKE :query
      )`, { query: `%${options.query}%` });
    }

    if (options.state) {
      query.andWhere(`
          report.state = :state 
      `, { state: options.state });
    }

    if (options.type_id) {
      query.andWhere(`
          report.report_type_id = :type_id
      `, { type_id: options.type_id });
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
    return await this.update(report_id, { state: REPORT_STATES.CLOSED });
  }

  async changeReportToInProgress(report_id: string) {
    return await this.update(report_id, { state: REPORT_STATES.IN_PROGRESS });
  }

  async solveReport(report_id: string) {
    return await this.update(report_id, { state: REPORT_STATES.SOLVED });
  }

  async openReport(report_id: string) {
    return await this.update(report_id, { state: REPORT_STATES.OPENED });
  }

  async updateUserReport(report_id: string, updateReportDto: UpdateReportDto, user: User) {
    const found = await this.reportsRepository.findOne({
      where: { report_id, user: { user_id: user.user_id } },
      relations: ['type']
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

  async findOne(id: string) {
    const found = await this.reportsRepository.findOneBy({
      report_id: id,
    });

    if (!found) {
      throw new NotFoundException("Denuncia no encontrada");
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

    const withType = await this.reportsRepository.findOne({
      where: { report_id: updated.report_id },
      relations: ['type']
    });

    return {
      report: withType,
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
