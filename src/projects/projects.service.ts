import { User } from '@/users/entities/user.entity';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private projectRepository: Repository<Project>
  ) { }

  async create(createProjectDto: CreateProjectDto, author: User) {
    const created = this.projectRepository.create({
      title: createProjectDto.title,
      description: createProjectDto.description,
      is_public: createProjectDto.is_public ?? false,
      user: author
    });

    await this.projectRepository.save(created);

    if (!created) {
      throw new InternalServerErrorException("Error al crear proyecto");
    }

    return { project: created, message: "Proyecto creado con éxito" };
  }

  async findByAuthor(author: User) {
    const found = await this.projectRepository.find({
      where: { user: { user_id: author.user_id } }
    });
    return found
  }

  async findAll() {
    const found = await this.projectRepository.find({
      where: { is_public: true }
    });
    return found;
  }

  async findOne(id: string) {
    const found = await this.projectRepository.findOneBy({
      project_id: id,
      is_public: true
    });

    if (!found) {
      throw new NotFoundException("Proyecto no encontrado");
    }

    return found;
  }

  async update(id: string, user: User, updateProjectDto: UpdateProjectDto) {
    const found = await this.projectRepository.findOne({
      where: { project_id: id, user: { user_id: user.user_id } }
    });

    if (!found) {
      throw new NotFoundException("Proyecto no encontrado");
    }

    const updated = this.projectRepository.merge(found, updateProjectDto);
    await this.projectRepository.save(updated);

    return updated;
  }

  async remove(id: string, user: User) {
    const result = await this.projectRepository.softDelete({ project_id: id, user: { user_id: user.user_id } });

    if (result.affected === 0) {
      throw new NotFoundException("Proyecto no encontrado");
    }

    return true;
  }
}
