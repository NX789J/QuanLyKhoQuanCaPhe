import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { Beverage } from '../beverages/entities/beverage.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { InventoryBatch } from '../inventory/entities/inventory-batch.entity';
import { InventoryTransaction } from '../inventory/entities/inventory-transaction.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ingredient,
      Beverage,
      Supplier,
      InventoryBatch,
      InventoryTransaction,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}