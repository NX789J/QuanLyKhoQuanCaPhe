// backend/src/modules/stock-receipts/entities/stock-receipt-item.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { StockReceipt } from './stock-receipt.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { ColumnNumericTransformer } from '../../../common/utils/column-numeric-transformer';

@Entity('stock_receipt_items')
export class StockReceiptItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'receipt_id', type: 'uuid' })
  receiptId: string;

  @ManyToOne(() => StockReceipt, (receipt) => receipt.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receipt_id' })
  receipt: StockReceipt;

  @Column({ name: 'ingredient_id', type: 'uuid' })
  ingredientId: string;

  @ManyToOne(() => Ingredient, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 4,
    transformer: new ColumnNumericTransformer(),
  })
  quantity: number;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  unitPrice: number;

  @Column({ name: 'expiration_date', type: 'timestamp' })
  expirationDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}