import { Image } from '@/images/entities/image.entity';
import { User } from '@/users/entities/user.entity';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REPORT_STATES, ReportState } from './consts/report.states';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Report } from './entities/report.entity';
import { ReportType } from './report-types/entities/report-type.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private reportsRepository: Repository<Report>,
    @InjectRepository(ReportType)
    private reportTypeRepository: Repository<ReportType>,
  ) { }

  async create(
    createReportDto: CreateReportDto,
    author: User,
    image: Image | undefined,
  ) {
    const reportType = await this.reportTypeRepository.findOne({
      where: { report_type_id: createReportDto.report_type_id }
    });

    if (!reportType) {
      throw new NotFoundException('Tipo de denuncia no encontrada');
    }

    const created = this.reportsRepository.create({
      title: createReportDto.title,
      description: createReportDto.description,
      address: createReportDto.address,
      state: REPORT_STATES.OPENED,
      image: image,
      user: author,
    });

    created.type = reportType;

    await this.reportsRepository.save(created);

    if (!created) {
      throw new InternalServerErrorException('Error al crear el reporte');
    }


    return { report: created, message: "Denuncia creada con éxito" };
  }

  async findByAuthor(author: User) {
    const found = await this.reportsRepository.find({
      where: { user: { user_id: author.user_id } },
      relations: ["type", "image", "user"]
    });
    return found;
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
      query.andWhere(
        `
          report.state = :state 
      `,
        { state: options.state },
      );
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
        type: { name: REPORT_STATES.OPENED },
      },
    });
  }

  async findCountByMonth() {
    const query = this.reportsRepository
      .createQueryBuilder('report')
      .select('COUNT(report.report_id)', 'reports')
      .addSelect('DATE_TRUNC(\'month\', report.created_at)', 'month_date')
      .addSelect('EXTRACT(YEAR FROM DATE_TRUNC(\'month\', report.created_at))', 'year')
      .addSelect('EXTRACT(MONTH FROM DATE_TRUNC(\'month\', report.created_at))', 'month')
      .groupBy('month_date')
      .orderBy('month_date', 'ASC');

    const result = await query.getRawMany();
    return result;
  }

  async findStateCountByMonth() {
    const query = this.reportsRepository
      .createQueryBuilder('report')
      .select('COUNT(report.report_id)', 'reports')
      .addSelect('DATE_TRUNC(\'month\', report.state_change_at)', 'month_date')
      .addSelect('EXTRACT(YEAR FROM DATE_TRUNC(\'month\', report.state_change_at))', 'year')
      .addSelect('EXTRACT(MONTH FROM DATE_TRUNC(\'month\', report.state_change_at))', 'month')
      .addSelect('report.state', 'state')
      .groupBy('month_date')
      .addGroupBy('state')
      .orderBy('month_date', 'ASC');

    const rawResult = await query.getRawMany();
    const result = rawResult.reduce((acc, item) => {
      acc[item.month + "-" + item.year] = {
        ...acc[item.month + "-" + item.year],
        [item.state]: +item.reports
      }
      return acc;
    }, {});
    return result;
  }


  async closeReport(report_id: string) {
    return await this.update(report_id, { state: REPORT_STATES.CLOSED }, new Date());
  }

  async changeReportToInProgress(report_id: string) {
    return await this.update(report_id, { state: REPORT_STATES.IN_PROGRESS }, new Date());
  }

  async solveReport(report_id: string) {
    return await this.update(report_id, { state: REPORT_STATES.SOLVED }, new Date());
  }

  async openReport(report_id: string) {
    return await this.update(report_id, { state: REPORT_STATES.OPENED }, new Date());
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

  async findOne(id: string, user: User) {
    const found = await this.reportsRepository.findOne({
      where: { report_id: id },
      relations: ['user', 'image', 'type']

    });

    if (!found) {
      throw new NotFoundException('Denuncia no encontrado');
    }

    // if (found.user.user_id != user.user_id) {
    //   throw new UnauthorizedException(
    //     'No estás autorizado a realizar esta acción.',
    //   );
    // }

    return found;
  }

  async update(id: string, updateReportDto: UpdateReportDto, state_change_at?: Date) {
    const found = await this.reportsRepository.findOne({
      where: { report_id: id },
    });

    if (!found) {
      throw new NotFoundException('Denuncia no encontrada');
    }

    if (updateReportDto.report_type_id) {
      const reportType = await this.reportTypeRepository.findOne({
        where: { report_type_id: updateReportDto.report_type_id },
      });

      if (!reportType) {
        throw new NotFoundException('Tipo de denuncia no encontrada');
      }
      found.type = reportType;
    }

    const updated = this.reportsRepository.merge(found, updateReportDto);

    if (state_change_at) {
      updated.state_change_at = state_change_at;
    }

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
    const result = await this.reportsRepository.softDelete({
      report_id: id,
      user: { user_id: user.user_id },
    });

    if (result.affected === 0) {
      throw new NotFoundException('Denuncia no encontrada');
    }

    return true;
  }
}
