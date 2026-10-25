// backend/src/modules/stock-receipts/entities/stock-receipt.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { User } from '../../users/entities/user.entity';
import { StockReceiptItem } from './stock-receipt-item.entity';
import { StockReceiptStatus } from '../../../common/enums/system.enum';
import { ColumnNumericTransformer } from '../../../common/utils/column-numeric-transformer';

@Entity('stock_receipts')
export class StockReceipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId: string;

  @ManyToOne(() => Supplier, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ type: 'enum', enum: StockReceiptStatus, default: StockReceiptStatus.DRAFT })
  status: StockReceiptStatus;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  totalAmount: number;

  @Column({ type: 'text', nullable: true })
  note: string;

  @OneToMany(() => StockReceiptItem, (item) => item.receipt, { cascade: true })
  items: StockReceiptItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}