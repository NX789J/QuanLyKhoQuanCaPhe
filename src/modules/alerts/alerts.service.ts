import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThanOrEqual } from 'typeorm';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { InventoryBatch } from '../inventory/entities/inventory-batch.entity';
import { BatchStatus } from '../../common/enums/system.enum';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
    @InjectRepository(InventoryBatch)
    private readonly batchRepository: Repository<InventoryBatch>,
  ) {}

  /**
   * Danh sách nguyên liệu tồn dưới ngưỡng tối thiểu
   */
  async getLowStockIngredients() {
    return this.ingredientRepository
      .createQueryBuilder('ingredient')
      .leftJoinAndSelect('ingredient.category', 'category')
      .where('ingredient.isActive = true')
      .andWhere('ingredient.currentStock <= ingredient.minStockLevel')
      .orderBy('ingredient.currentStock', 'ASC')
      .getMany();
  }

  /**
   * Danh sách Lô hàng sắp hết hạn trong N ngày (mặc định 30 ngày)
   */
  async getExpiringBatches(daysThreshold: number = 30) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + Number(daysThreshold));

    return this.batchRepository
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.ingredient', 'ingredient')
      .where('batch.status = :status', { status: BatchStatus.ACTIVE })
      .andWhere('batch.currentQuantity > 0')
      .andWhere('batch.expiryDate <= :targetDate', { targetDate })
      .orderBy('batch.expiryDate', 'ASC')
      .getMany();
  }
}