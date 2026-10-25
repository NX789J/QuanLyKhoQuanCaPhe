import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IngredientCategory } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(IngredientCategory)
    private readonly categoryRepository: Repository<IngredientCategory>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const existing = await this.categoryRepository.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException(`Danh mục '${dto.name}' đã tồn tại.`);
    }
    const category = this.categoryRepository.create(dto);
    return this.categoryRepository.save(category);
  }

  async findAll() {
    return this.categoryRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['ingredients'],
    });
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['ingredients'],
    });
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục nguyên liệu.');
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    if (dto.name && dto.name !== category.name) {
      const existing = await this.categoryRepository.findOne({ where: { name: dto.name } });
      if (existing) {
        throw new ConflictException(`Danh mục '${dto.name}' đã tồn tại.`);
      }
    }
    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    if (category.ingredients && category.ingredients.length > 0) {
      throw new ConflictException('Không thể xóa danh mục đang chứa nguyên liệu.');
    }
    return this.categoryRepository.remove(category);
  }
}