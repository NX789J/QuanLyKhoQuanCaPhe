import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStockReceiptItemDto {
  @IsUUID('4', { message: 'ID nguyên liệu phải là UUID v4.' })
  @IsNotEmpty()
  ingredientId: string;

  @IsNumber()
  @Min(0.0001, { message: 'Số lượng nhập phải lớn hơn 0.' })
  quantity: number;

  @IsNumber()
  @Min(0, { message: 'Đơn giá nhập không được âm.' })
  unitPrice: number;

  @IsDateString({}, { message: 'Hạn sử dụng phải đúng định dạng ngày ISO.' })
  @IsNotEmpty()
  expirationDate: string;
}

export class CreateStockReceiptDto {
  @IsUUID('4', { message: 'ID nhà cung cấp phải là UUID v4.' })
  @IsNotEmpty()
  supplierId: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStockReceiptItemDto)
  @IsNotEmpty({ message: 'Danh sách nguyên liệu nhập không được rỗng.' })
  items: CreateStockReceiptItemDto[];
}