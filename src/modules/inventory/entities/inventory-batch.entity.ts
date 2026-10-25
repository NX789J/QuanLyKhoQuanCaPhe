// backend/src/modules/inventory/entities/inventory-batch.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { StockReceiptItem } from '../../stock-receipts/entities/stock-receipt-item.entity';
import { BatchStatus } from '../../../common/enums/system.enum';
import { ColumnNumericTransformer } from '../../../common/utils/column-numeric-transformer';

@Entity('inventory_batches')
export class InventoryBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'batch_number', type: 'varchar', length: 100, unique: true })
  batchNumber: string;

  @Column({ name: 'ingredient_id', type: 'uuid' })
  ingredientId: string;

  @ManyToOne(() => Ingredient, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;

  @Column({ name: 'receipt_item_id', type: 'uuid', nullable: true })
  receiptItemId: string;

  @ManyToOne(() => StockReceiptItem, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'receipt_item_id' })
  receiptItem: StockReceiptItem;

  @Column({
    name: 'initial_quantity',
    type: 'decimal',
    precision: 12,
    scale: 4,
    transformer: new ColumnNumericTransformer(),
  })
  initialQuantity: number;

  @Column({
    name: 'current_quantity',
    type: 'decimal',
    precision: 12,
    scale: 4,
    transformer: new ColumnNumericTransformer(),
  })
  currentQuantity: number;

  @Column({
    name: 'unit_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  unitCost: number;

  @Index()
  @Column({ name: 'expiry_date', type: 'timestamp' })
  expiryDate: Date;

  @Column({ type: 'enum', enum: BatchStatus, default: BatchStatus.ACTIVE })
  status: BatchStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}