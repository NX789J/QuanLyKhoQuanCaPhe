// backend/src/modules/inventory/entities/inventory-transaction.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { InventoryBatch } from './inventory-batch.entity';
import { TransactionType } from '../../../common/enums/system.enum';
import { ColumnNumericTransformer } from '../../../common/utils/column-numeric-transformer';

@Entity('inventory_transactions')
export class InventoryTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ingredient_id', type: 'uuid' })
  ingredientId: string;

  @ManyToOne(() => Ingredient, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;

  @Column({ name: 'batch_id', type: 'uuid', nullable: true })
  batchId: string | null;

  @ManyToOne(() => InventoryBatch, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'batch_id' })
  batch: InventoryBatch;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({
    name: 'quantity_change',
    type: 'decimal',
    precision: 12,
    scale: 4,
    transformer: new ColumnNumericTransformer(),
  })
  quantityChange: number;

  @Column({
    name: 'balance_after',
    type: 'decimal',
    precision: 12,
    scale: 4,
    transformer: new ColumnNumericTransformer(),
  })
  balanceAfter: number;

  @Column({ name: 'reference_type', type: 'varchar', length: 50, nullable: true })
  referenceType: string;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId: string;

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}