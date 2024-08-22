import { ROLES } from '@/auth/consts';
import { Role } from '@/auth/decorators/role.decorator';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { RoleGuard } from '@/auth/guards/role.guard';
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
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { ALLOWED_REPORT_STATES, ReportState } from './consts/report.states';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsService } from './reports.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from '@/images/images.service';
import { Image } from '@/images/entities/image.entity';
import { diskStorage } from 'multer';


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
          cb(null, req.user?.user_id+ '-' +file.originalname);
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
  findAll(@Query('q') query: string, @Query('state') state: string) {
    if (state && !ALLOWED_REPORT_STATES.includes(state as ReportState)) {
      throw new NotFoundException('Estado de denuncia desconocido');
    }
    return this.reportsService.findAll({
      query,
      state: state as ReportState,
    });
  }

  @Role(ROLES.ADMIN)
  @Get('/opened')
  findAllOpened() {
    return this.reportsService.findAllOpened();
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
  update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
    @Req() req: Request,
  ) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.reportsService.update(id, updateReportDto);
  }

  @Role(ROLES.ADMIN)
  @Patch(':id/close')
  async closeReport(@Param('id') report_id: string) {
    return this.reportsService.closeReport(report_id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.reportsService.remove(id, user);
  }
}
