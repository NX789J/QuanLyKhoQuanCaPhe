import { IsOptional, IsString, IsUUID, IsNumber, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryIngredientDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  search?: string;

  @IsUUID('4', { message: 'ID danh mục phải là UUID v4 hợp lệ.' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  categoryId?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}