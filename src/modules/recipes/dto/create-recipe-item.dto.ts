import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class CreateRecipeItemDto {
  @IsUUID('4', { message: 'ID nguyên liệu phải là UUID v4 hợp lệ.' })
  @IsNotEmpty()
  ingredientId: string;

  @IsNumber()
  @Min(0.0001, { message: 'Số lượng nguyên liệu phải lớn hơn 0.' })
  quantity: number;

  @IsString()
  @IsNotEmpty({ message: 'Đơn vị tính pha chế không được để trống.' })
  unit: string;
}