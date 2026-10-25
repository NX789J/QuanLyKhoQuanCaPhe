import { IsArray, IsNotEmpty, IsNumber, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStockIssueItemDto {
  @IsUUID('4', { message: 'ID nguyên liệu phải là UUID v4.' })
  @IsNotEmpty()
  ingredientId: string;

  @IsNumber()
  @Min(0.0001, { message: 'Số lượng xuất phải lớn hơn 0.' })
  quantity: number;
}

export class CreateStockIssueDto {
  @IsString()
  @IsNotEmpty({ message: 'Lý do xuất kho không được để trống.' })
  reason: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStockIssueItemDto)
  @IsNotEmpty({ message: 'Danh sách nguyên liệu xuất không được rỗng.' })
  items: CreateStockIssueItemDto[];
}