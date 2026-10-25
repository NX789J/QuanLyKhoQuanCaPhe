// backend/src/modules/ingredients/entities/ingredient.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { IngredientCategory } from '../../categories/entities/category.entity';
import { ColumnNumericTransformer } from '../../../common/utils/column-numeric-transformer';

@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => IngredientCategory, (category) => category.ingredients, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: IngredientCategory;

  @Column({ name: 'base_unit', type: 'varchar', length: 20 })
  baseUnit: string;

  @Column({
    name: 'min_stock_level',
    type: 'decimal',
    precision: 12,
    scale: 4,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  minStockLevel: number;

  @Column({
    name: 'current_stock',
    type: 'decimal',
    precision: 12,
    scale: 4,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  currentStock: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}