import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { InventoryBatch } from '../inventory/entities/inventory-batch.entity';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ingredient, InventoryBatch])],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}