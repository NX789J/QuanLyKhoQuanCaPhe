// backend/src/modules/beverages/entities/beverage.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { RecipeItem } from '../../recipes/entities/recipe-item.entity';
import { ColumnNumericTransformer } from '../../../common/utils/column-numeric-transformer';

@Entity('beverages')
export class Beverage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({
    name: 'selling_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  sellingPrice: number;

  @Column({
    name: 'estimated_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  estimatedCost: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => RecipeItem, (item) => item.beverage, { cascade: true })
  recipeItems: RecipeItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}