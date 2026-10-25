import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRoleEnum } from '../../common/enums/system.enum';


@Injectable()
export class AuthService {
  [x: string]: any;
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email này đã được sử dụng.');
    }

    const targetRoleName = registerDto.roleName || UserRoleEnum.STAFF;
    const role = await this.roleRepository.findOne({
      where: { name: targetRoleName as UserRoleEnum },
    });

    if (!role) {
      throw new NotFoundException(`Quyền '${targetRoleName}' không tồn tại trong hệ thống.`);
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const newUser = this.userRepository.create({
      email: registerDto.email,
      fullName: registerDto.fullName,
      passwordHash,
      roleId: role.id,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(newUser);

    return {
      id: savedUser.id,
      email: savedUser.email,
      fullName: savedUser.fullName,
      role: role.name,
      createdAt: savedUser.createdAt,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['role'],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác hoặc tài khoản đã bị khóa.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Không tìm thấy thông tin người dùng.');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role.name,
      createdAt: user.createdAt,
    };
  }
}