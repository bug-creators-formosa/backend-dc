import { Injectable } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs/promises';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image) private imageRepository: Repository<Image>,
  ) {}

  async create(image: Express.Multer.File) {
    const new_image = new CreateImageDto();

    console.log(image);

    new_image.title = image.filename;
    new_image.mime = image.mimetype;

    return await this.imageRepository.save(new_image);
  }

  async findOne(id: string) {
    return await this.imageRepository.findOne({
      where: { image_id: id },
    });
  }

  update(id: number, updateImageDto: UpdateImageDto) {
    return `This action updates a #${id} image`;
  }

  remove(id: number) {
    return `This action removes a #${id} image`;
  }
}
