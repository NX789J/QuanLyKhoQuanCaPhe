import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRecipeItemDto } from '../../recipes/dto/create-recipe-item.dto';

export class CreateBeverageDto {
  @IsString()
  @IsNotEmpty({ message: 'Mã đồ uống không được để trống.' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên đồ uống không được để trống.' })
  name: string;

  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecipeItemDto)
  @IsOptional()
  recipeItems?: CreateRecipeItemDto[];
}