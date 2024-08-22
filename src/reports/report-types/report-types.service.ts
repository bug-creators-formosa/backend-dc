import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReportTypeDto } from './dto/create-report-type.dto';
import { UpdateReportTypeDto } from './dto/update-report-type.dto';
import { ReportType } from './entities/report-type.entity';

@Injectable()
export class ReportTypesService {
  constructor(
    @InjectRepository(ReportType)
    private reportTypeRepository: Repository<ReportType>,
  ) { }

  async create(createReportTypeDto: CreateReportTypeDto) {
    const foundedType = await this.reportTypeRepository.findOne({
      where: { name: createReportTypeDto.name },
    });

    if (foundedType) {
      throw new ConflictException(
        'Ya existe un tipo de denuncia con ese nombre',
      );
    }

    const newType = this.reportTypeRepository.create(createReportTypeDto);

    await this.reportTypeRepository.save(newType);

    if (!newType) {
      throw new InternalServerErrorException(
        'Error al crear el tipo de denuncia',
      );
    }

    return {
      reportType: newType,
      message: 'Tipo de denuncia creado con éxito',
    };
  }

  async findAll() {
    return await this.reportTypeRepository.find();
  }

  async findOne(id: string) {
    const foundedType = await this.reportTypeRepository.findOne({
      where: { report_type_id: id },
    });

    if (!foundedType) {
      throw new NotFoundException('Tipo de denuncia no encontrado');
    }

    return foundedType;
  }

  async update(id: string, updateReportTypeDto: UpdateReportTypeDto) {
    const reportType = await this.reportTypeRepository.findOne({
      where: { report_type_id: id },
    });

    if (!reportType) {
      throw new NotFoundException('Tipo de denuncia no encontrada');
    }

    const updatedType = this.reportTypeRepository.merge(
      reportType,
      updateReportTypeDto,
    );

    await this.reportTypeRepository.save(updatedType);

    return {
      reportType: updatedType,
      message: 'Tipo de denuncia actualizado con éxito',
    };
  }

  async remove(id: string) {
    const reportType = await this.reportTypeRepository.findOne({
      where: { report_type_id: id },
      relations: ['reports'],
    });


    if (!reportType) {
      throw new NotFoundException('Tipo de denuncia no encontrada');
    }

    // elimina solo si no posee un reporte asociado
    if (reportType.reports.length > 0) {
      throw new InternalServerErrorException(
        'No se puede eliminar el tipo de denuncia porque posee denuncias asociadas',
      );
    }

    await this.reportTypeRepository.softDelete({ report_type_id: id });

    return {
      reportType,
      message: 'Tipo de denuncia eliminado con éxito',
    };
  }

  async findMostReportedTypes() {
    const query = this.reportTypeRepository
      .createQueryBuilder('type')
      .leftJoin('type.reports', 'report')
      .select('COUNT(report.report_id)', 'reports')
      .addSelect('type.name', 'type_name')
      .groupBy('type_name')
      .limit(5)
      .orderBy('reports', 'DESC');

    const result = await query.getRawMany();
    return result;
  }
}
