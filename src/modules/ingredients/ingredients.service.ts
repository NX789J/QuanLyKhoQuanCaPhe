import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { InventoryBatch } from '../inventory/entities/inventory-batch.entity';
import { InventoryTransaction } from '../inventory/entities/inventory-transaction.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { QueryIngredientDto } from './dto/query-ingredient.dto';
import { BatchStatus, TransactionType } from '../../common/enums/system.enum';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateIngredientDto) {
    const existing = await this.ingredientRepository.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException(`Mã nguyên liệu '${dto.code}' đã tồn tại.`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const initialQty = dto.initialStock || 0;

      const ingredient = queryRunner.manager.create(Ingredient, {
        code: dto.code,
        name: dto.name,
        categoryId: dto.categoryId,
        baseUnit: dto.baseUnit,
        minStockLevel: dto.minStockLevel || 0,
        currentStock: initialQty,
      });

      const savedIngredient = await queryRunner.manager.save(ingredient);

      // Nếu có khởi tạo tồn kho ban đầu -> Tự động sinh 1 Lô hàng ban đầu
      if (initialQty > 0) {
        const expiry = dto.expiryDate
          ? new Date(dto.expiryDate)
          : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000); // Mặc định +180 ngày

        const batch = queryRunner.manager.create(InventoryBatch, {
          batchNumber: `BAT-INIT-${savedIngredient.code}-${Date.now().toString().slice(-4)}`,
          ingredientId: savedIngredient.id,
          initialQuantity: initialQty,
          currentQuantity: initialQty,
          unitCost: 0,
          expiryDate: expiry,
          status: BatchStatus.ACTIVE,
        });

        const savedBatch = await queryRunner.manager.save(batch);

        const tx = queryRunner.manager.create(InventoryTransaction, {
          ingredientId: savedIngredient.id,
          batchId: savedBatch.id,
          type: TransactionType.IMPORT,
          quantityChange: initialQty,
          balanceAfter: initialQty,
          referenceType: 'INITIAL_STOCK',
        });
        await queryRunner.manager.save(tx);
      }

      await queryRunner.commitTransaction();
      return this.findOne(savedIngredient.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: QueryIngredientDto) {
    const { search, categoryId, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.ingredientRepository
      .createQueryBuilder('ingredient')
      .leftJoinAndSelect('ingredient.category', 'category')
      .where('ingredient.isActive = :isActive', { isActive: true });

    if (search) {
      queryBuilder.andWhere(
        '(ingredient.name ILIKE :search OR ingredient.code ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      queryBuilder.andWhere('ingredient.categoryId = :categoryId', { categoryId });
    }

    const [items, total] = await queryBuilder
      .orderBy('ingredient.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Lấy HSD gần nhất của từng nguyên liệu
    const enrichedItems = await Promise.all(
      items.map(async (ing) => {
        const earliestBatch = await this.dataSource.getRepository(InventoryBatch).findOne({
          where: { ingredientId: ing.id, status: BatchStatus.ACTIVE },
          order: { expiryDate: 'ASC' },
        });

        return {
          ...ing,
          nearestExpiryDate: earliestBatch ? earliestBatch.expiryDate : null,
        };
      }),
    );

    return {
      items: enrichedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const ingredient = await this.ingredientRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!ingredient) {
      throw new NotFoundException('Không tìm thấy nguyên liệu.');
    }
    return ingredient;
  }

  async update(id: string, dto: UpdateIngredientDto) {
    const ingredient = await this.findOne(id);
    if (dto.code && dto.code !== ingredient.code) {
      const existing = await this.ingredientRepository.findOne({ where: { code: dto.code } });
      if (existing) {
        throw new ConflictException(`Mã nguyên liệu '${dto.code}' đã tồn tại.`);
      }
    }
    Object.assign(ingredient, dto);
    return this.ingredientRepository.save(ingredient);
  }

  async remove(id: string) {
    const ingredient = await this.findOne(id);
    ingredient.isActive = false;
    return this.ingredientRepository.save(ingredient);
  }
}