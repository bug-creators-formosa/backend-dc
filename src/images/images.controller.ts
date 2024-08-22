import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { Response } from 'express';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const foundImage = await this.imagesService.findOne(id);

    if (!foundImage) {
      throw new NotFoundException('Imagen no encontrada');
    }

    return res.sendFile(foundImage.title, { root: './uploads' });
  }
}
