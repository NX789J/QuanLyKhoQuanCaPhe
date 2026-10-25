// backend/src/modules/stock-issues/entities/stock-issue-item.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { StockIssue } from './stock-issue.entity';
import { InventoryBatch } from '../../inventory/entities/inventory-batch.entity';
import { ColumnNumericTransformer } from '../../../common/utils/column-numeric-transformer';

@Entity('stock_issue_items')
export class StockIssueItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'issue_id', type: 'uuid' })
  issueId: string;

  @ManyToOne(() => StockIssue, (issue) => issue.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'issue_id' })
  issue: StockIssue;

  @Column({ name: 'batch_id', type: 'uuid' })
  batchId: string;

  @ManyToOne(() => InventoryBatch, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'batch_id' })
  batch: InventoryBatch;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 4,
    transformer: new ColumnNumericTransformer(),
  })
  quantity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}