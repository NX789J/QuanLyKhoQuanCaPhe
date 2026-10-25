import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { Beverage } from '../beverages/entities/beverage.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { InventoryBatch } from '../inventory/entities/inventory-batch.entity';
import { InventoryTransaction } from '../inventory/entities/inventory-transaction.entity';
import { BatchStatus } from '../../common/enums/system.enum';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
    @InjectRepository(Beverage)
    private readonly beverageRepository: Repository<Beverage>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(InventoryBatch)
    private readonly batchRepository: Repository<InventoryBatch>,
    @InjectRepository(InventoryTransaction)
    private readonly transactionRepository: Repository<InventoryTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  async getDashboardSummary() {
    const totalIngredients = await this.ingredientRepository.count({ where: { isActive: true } });
    const totalBeverages = await this.beverageRepository.count({ where: { isActive: true } });
    const totalSuppliers = await this.supplierRepository.count({ where: { isActive: true } });

    // Số lượng nguyên liệu tồn kho chạm ngưỡng cảnh báo
    const lowStockCount = await this.ingredientRepository
      .createQueryBuilder('ingredient')
      .where('ingredient.isActive = true')
      .andWhere('ingredient.currentStock <= ingredient.minStockLevel')
      .getCount();

    // Số lượng lô sắp hết hạn trong 30 ngày
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);

    const expiringBatchCount = await this.batchRepository
      .createQueryBuilder('batch')
      .where('batch.status = :status', { status: BatchStatus.ACTIVE })
      .andWhere('batch.currentQuantity > 0')
      .andWhere('batch.expiryDate <= :targetDate', { targetDate })
      .getCount();

    // Tính tổng giá trị tồn kho từ PostgreSQL
    const { totalStockValue } = await this.batchRepository
      .createQueryBuilder('batch')
      .select('SUM(batch.currentQuantity * batch.unitCost)', 'totalStockValue')
      .where('batch.status = :status', { status: BatchStatus.ACTIVE })
      .getRawOne();

    return {
      totalIngredients,
      totalBeverages,
      totalSuppliers,
      lowStockCount,
      expiringBatchCount,
      totalStockValue: Math.round(Number(totalStockValue || 0)),
    };
  }

  async getTransactionHistory() {
    return this.transactionRepository.find({
      relations: ['ingredient', 'batch'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}