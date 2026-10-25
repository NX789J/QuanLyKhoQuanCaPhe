import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
    @IsNotEmpty({ message: 'Email không được để trống.' })
    email!: string;

  @IsString()
    @IsNotEmpty({ message: 'Mật khẩu không được để trống.' })
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự.' })
    password!: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ và tên không được để trống.' })
  fullName: string | undefined;

  @IsString()
  @IsOptional()
  roleName?: string; // Mặc định STAFF nếu không truyền
}