import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async create(dto: CreateSupplierDto) {
    const supplier = this.supplierRepository.create(dto);
    return this.supplierRepository.save(supplier);
  }

  async findAll() {
    return this.supplierRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const supplier = await this.supplierRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException('Không tìm thấy nhà cung cấp.');
    }
    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto) {
    const supplier = await this.findOne(id);
    Object.assign(supplier, dto);
    return this.supplierRepository.save(supplier);
  }

  async remove(id: string) {
    const supplier = await this.findOne(id);
    supplier.isActive = false;
    return this.supplierRepository.save(supplier);
  }
}