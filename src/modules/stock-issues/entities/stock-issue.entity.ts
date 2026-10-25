// backend/src/modules/stock-issues/entities/stock-issue.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { StockIssueItem } from './stock-issue-item.entity';
import { StockIssueStatus } from '../../../common/enums/system.enum';

@Entity('stock_issues')
export class StockIssue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ type: 'enum', enum: StockIssueStatus, default: StockIssueStatus.COMPLETED })
  status: StockIssueStatus;

  @OneToMany(() => StockIssueItem, (item) => item.issue, { cascade: true })
  items: StockIssueItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}