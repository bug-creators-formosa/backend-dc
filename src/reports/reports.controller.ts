import { ROLES } from '@/auth/consts';
import { Role } from '@/auth/decorators/role.decorator';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { RoleGuard } from '@/auth/guards/role.guard';
import { Image } from '@/images/entities/image.entity';
import { ImagesService } from '@/images/images.service';
import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { ALLOWED_REPORT_STATES, ReportState } from './consts/report.states';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsService } from './reports.service';

const uuidPipe = new ParseUUIDPipe({
  optional: false,
  exceptionFactory: () =>
    new NotFoundException('El ID de la denuncia no es válido'),
});

@Controller('reports')
@UseGuards(RoleGuard)
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly imageService: ImagesService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: process.cwd() + '/uploads',
        filename: (req, file, cb) => {
          cb(null, req.user?.user_id + '-' + file.originalname);
        },
      }),
    }),
  )
  async create(
    @Body() createProjectDto: CreateReportDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 100,
            message: 'El tamaño máximo permitido es de 100MB',
          }),
          new FileTypeValidator({ fileType: '(jpg|jpeg|png)' }),
        ],
      }),
    )
    image: Express.Multer.File,
    @Req() req: Request,
  ) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    let new_image: Image | undefined;
    if (image) {
      new_image = await this.imageService.create(image);
    }

    return this.reportsService.create(createProjectDto, user, new_image);
  }

  @Role(ROLES.ADMIN)
  @Get()
  findAll(
    @Query('q') query?: string,
    @Query('state') state?: string,
    @Query(
      'type_id',
      new ParseUUIDPipe({
        optional: true,
        exceptionFactory: () =>
          new NotFoundException('El ID de tipo debe ser un UUID válido'),
      }),
    )
    type_id?: string,
  ) {
    if (state && !ALLOWED_REPORT_STATES.includes(state as ReportState)) {
      throw new NotFoundException('Estado de denuncia desconocido');
    }
    return this.reportsService.findAll({
      query,
      state: state as ReportState,
      type_id,
    });
  }

  @Role(ROLES.ADMIN)
  @Get('/opened')
  findAllOpened() {
    return this.reportsService.findAllOpened();
  }

  @Role(ROLES.ADMIN)
  @Get('/by-month')
  findByMonth() {
    return this.reportsService.findCountByMonth();
  }

  @Role(ROLES.ADMIN)
  @Get('/by-state-and-month')
  findByStateAndMonth() {
    return this.reportsService.findStateCountByMonth();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return this.reportsService.findOne(id, user);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: process.cwd() + '/uploads',
        filename: (req, file, cb) => {
          cb(null, req.user?.user_id + '-' + file.originalname);
        },
      }),
    }),
  )
  async update(
    @Param('id', uuidPipe) id: string,
    @Body() updateReportDto: UpdateReportDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 100,
            message: 'El tamaño máximo permitido es de 100MB',
          }),
          new FileTypeValidator({ fileType: '(jpg|jpeg|png)' }),
        ],
      }),
    )
    image: Express.Multer.File,
    @Req() req: Request,
  ) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    let new_image: Image | undefined;
    if (image) {
      new_image = await this.imageService.create(image);
    }

    return this.reportsService.updateUserReport(
      id,
      updateReportDto,
      user,
      new_image,
    );
  }

  @Role(ROLES.ADMIN)
  @Patch(':id/closed')
  async closeReport(@Param('id', uuidPipe) report_id: string) {
    return this.reportsService.closeReport(report_id);
  }

  @Role(ROLES.ADMIN)
  @Patch(':id/in-progress')
  async changeReportToProgress(@Param('id', uuidPipe) report_id: string) {
    return this.reportsService.changeReportToInProgress(report_id);
  }

  @Role(ROLES.ADMIN)
  @Patch(':id/solved')
  async solveReport(@Param('id', uuidPipe) report_id: string) {
    return this.reportsService.solveReport(report_id);
  }

  @Role(ROLES.ADMIN)
  @Patch(':id/opened')
  async openReport(@Param('id', uuidPipe) report_id: string) {
    return this.reportsService.openReport(report_id);
  }

  @Delete(':id')
  remove(@Param('id', uuidPipe) id: string, @Req() req: Request) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.reportsService.remove(id, user);
  }
}
