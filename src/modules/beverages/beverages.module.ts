import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Beverage } from './entities/beverage.entity';
import { RecipeItem } from '../recipes/entities/recipe-item.entity';
import { InventoryBatch } from '../inventory/entities/inventory-batch.entity';
import { BeveragesService } from './beverages.service';
import { BeveragesController } from './beverages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Beverage, RecipeItem, InventoryBatch])],
  controllers: [BeveragesController],
  providers: [BeveragesService],
  exports: [BeveragesService],
})
export class BeveragesModule {}