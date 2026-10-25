// backend/src/modules/recipes/entities/recipe-item.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Beverage } from '../../beverages/entities/beverage.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { ColumnNumericTransformer } from '../../../common/utils/column-numeric-transformer';

@Entity('recipe_items')
export class RecipeItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'beverage_id', type: 'uuid' })
  beverageId: string;

  @ManyToOne(() => Beverage, (beverage) => beverage.recipeItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'beverage_id' })
  beverage: Beverage;

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

  @Column({ type: 'varchar', length: 20 })
  unit: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}