import { PartialType } from '@nestjs/mapped-types';
import { CreateReportTypeDto } from './create-report-type.dto';

export class UpdateReportTypeDto extends PartialType(CreateReportTypeDto) {}
