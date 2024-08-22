import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { ALLOWED_REPORT_STATES, ReportState } from '../consts/report.states';
import { CreateReportDto } from './create-report.dto';

const message = new Intl.ListFormat("es", {
    type: "disjunction"
}).format(ALLOWED_REPORT_STATES);

export class UpdateReportDto extends PartialType(CreateReportDto) {
    @IsOptional()
    @IsIn(ALLOWED_REPORT_STATES, {
        message: `El estado de la denuncia debe ser uno de ${message}`
    })
    state: ReportState;

}
