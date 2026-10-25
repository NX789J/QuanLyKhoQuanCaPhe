import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Beverage } from './entities/beverage.entity';
import { RecipeItem } from '../recipes/entities/recipe-item.entity';
import { InventoryBatch } from '../inventory/entities/inventory-batch.entity';
import { CreateBeverageDto } from './dto/create-beverage.dto';
import { UpdateBeverageDto } from './dto/update-beverage.dto';

@Injectable()
export class BeveragesService {
  constructor(
    @InjectRepository(Beverage)
    private readonly beverageRepository: Repository<Beverage>,
    @InjectRepository(RecipeItem)
    private readonly recipeItemRepository: Repository<RecipeItem>,
    @InjectRepository(InventoryBatch)
    private readonly batchRepository: Repository<InventoryBatch>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateBeverageDto) {
    const existing = await this.beverageRepository.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException(`Mã đồ uống '${dto.code}' đã tồn tại.`);
    }

    const beverage = this.beverageRepository.create({
      code: dto.code,
      name: dto.name,
      sellingPrice: dto.sellingPrice,
      estimatedCost: 0,
    });

    const savedBeverage = await this.beverageRepository.save(beverage);

    if (dto.recipeItems && dto.recipeItems.length > 0) {
      const items = dto.recipeItems.map((item) =>
        this.recipeItemRepository.create({
          beverageId: savedBeverage.id,
          ingredientId: item.ingredientId,
          quantity: item.quantity,
          unit: item.unit,
        }),
      );
      await this.recipeItemRepository.save(items);
    }

    await this.recalculateCost(savedBeverage.id);
    return this.findOne(savedBeverage.id);
  }

  async findAll() {
    const beverages = await this.beverageRepository.find({
      where: { isActive: true },
      relations: ['recipeItems', 'recipeItems.ingredient'],
      order: { createdAt: 'DESC' },
    });

    for (const bev of beverages) {
      await this.recalculateCost(bev.id);
    }

    return this.beverageRepository.find({
      where: { isActive: true },
      relations: ['recipeItems', 'recipeItems.ingredient'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const beverage = await this.beverageRepository.findOne({
      where: { id, isActive: true },
      relations: ['recipeItems', 'recipeItems.ingredient'],
    });
    if (!beverage) {
      throw new NotFoundException('Không tìm thấy món đồ uống.');
    }
    return beverage;
  }

  async update(id: string, dto: UpdateBeverageDto) {
    const beverage = await this.findOne(id);

    if (dto.code && dto.code !== beverage.code) {
      const existing = await this.beverageRepository.findOne({ where: { code: dto.code } });
      if (existing) {
        throw new ConflictException(`Mã đồ uống '${dto.code}' đã tồn tại.`);
      }
    }

    if (dto.sellingPrice !== undefined) beverage.sellingPrice = dto.sellingPrice;
    if (dto.name !== undefined) beverage.name = dto.name;
    if (dto.code !== undefined) beverage.code = dto.code;

    await this.beverageRepository.save(beverage);

    if (dto.recipeItems) {
      await this.recipeItemRepository.delete({ beverageId: id });
      const items = dto.recipeItems.map((item) =>
        this.recipeItemRepository.create({
          beverageId: id,
          ingredientId: item.ingredientId,
          quantity: item.quantity,
          unit: item.unit,
        }),
      );
      await this.recipeItemRepository.save(items);
    }

    await this.recalculateCost(id);
    return this.findOne(id);
  }

  async remove(id: string) {
    const beverage = await this.findOne(id);
    beverage.isActive = false;
    return this.beverageRepository.save(beverage);
  }

  /**
   * Tính toán giá vốn ước tính (COGS) dựa trên giá nhập mới nhất trong InventoryBatch
   */
  async recalculateCost(beverageId: string): Promise<number> {
    const beverage = await this.beverageRepository.findOne({
      where: { id: beverageId },
      relations: ['recipeItems', 'recipeItems.ingredient'],
    });

    if (!beverage || !beverage.recipeItems || beverage.recipeItems.length === 0) {
      beverage!.estimatedCost = 0;
      await this.beverageRepository.save(beverage!);
      return 0;
    }

    let totalCost = 0;

    for (const item of beverage.recipeItems) {
      const latestBatch = await this.batchRepository.findOne({
        where: { ingredientId: item.ingredientId },
        order: { createdAt: 'DESC' },
      });

      const unitCost = latestBatch ? latestBatch.unitCost : 0;
      totalCost += Number(item.quantity) * Number(unitCost);
    }

    beverage.estimatedCost = Math.round(totalCost * 100) / 100;
    await this.beverageRepository.save(beverage);
    return beverage.estimatedCost;
  }
}