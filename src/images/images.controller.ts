import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  StreamableFile,
  Res,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { Response } from 'express';

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
