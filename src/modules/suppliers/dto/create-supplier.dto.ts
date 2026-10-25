import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên nhà cung cấp không được để trống.' })
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;
}