import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, IsDateString } from 'class-validator';

export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty({ message: 'Mã nguyên liệu không được để trống.' })
  code!: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên nguyên liệu không được để trống.' })
  name?: string;

  @IsUUID('4', { message: 'ID danh mục phải là UUID v4 hợp lệ.' })
  @IsNotEmpty()
  categoryId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Đơn vị tính không được để trống.' })
  baseUnit?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minStockLevel?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  initialStock?: number;

  @IsDateString({}, { message: 'Hạn sử dụng phải đúng định dạng ngày YYYY-MM-DD.' })
  @IsOptional()
  expiryDate?: string;
}