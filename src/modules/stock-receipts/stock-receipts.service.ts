import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StockReceipt } from './entities/stock-receipt.entity';
import { StockReceiptItem } from './entities/stock-receipt-item.entity';
import { InventoryBatch } from '../inventory/entities/inventory-batch.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { InventoryTransaction } from '../inventory/entities/inventory-transaction.entity';
import { CreateStockReceiptDto } from './dto/create-stock-receipt.dto';
import { StockReceiptStatus, BatchStatus, TransactionType } from '../../common/enums/system.enum';

@Injectable()
export class StockReceiptsService {
  constructor(
    @InjectRepository(StockReceipt)
    private readonly receiptRepository: Repository<StockReceipt>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateStockReceiptDto, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const code = `IMP-${Date.now().toString().slice(-8)}`;
      let totalAmount = 0;

      const receipt = queryRunner.manager.create(StockReceipt, {
        code,
        supplierId: dto.supplierId,
        createdBy: userId,
        status: StockReceiptStatus.DRAFT,
        note: dto.note,
        totalAmount: 0,
      });

      const savedReceipt = await queryRunner.manager.save(receipt);

      const items: StockReceiptItem[] = [];
      for (const itemDto of dto.items) {
        const itemAmount = Number(itemDto.quantity) * Number(itemDto.unitPrice);
        totalAmount += itemAmount;

        const item = queryRunner.manager.create(StockReceiptItem, {
          receiptId: savedReceipt.id,
          ingredientId: itemDto.ingredientId,
          quantity: itemDto.quantity,
          unitPrice: itemDto.unitPrice,
          expirationDate: new Date(itemDto.expirationDate),
        });
        items.push(item);
      }

      await queryRunner.manager.save(items);

      savedReceipt.totalAmount = totalAmount;
      await queryRunner.manager.save(savedReceipt);

      await queryRunner.commitTransaction();
      return this.findOne(savedReceipt.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return this.receiptRepository.find({
      relations: ['supplier', 'creator', 'items', 'items.ingredient'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const receipt = await this.receiptRepository.findOne({
      where: { id },
      relations: ['supplier', 'creator', 'items', 'items.ingredient'],
    });
    if (!receipt) {
      throw new NotFoundException('Không tìm thấy phiếu nhập kho.');
    }
    return receipt;
  }

  /**
   * Xác nhận Phiếu Nhập Kho -> Sinh Lô Hàng (Batch) + Tăng Tồn Kho + Ghi Transaction Log
   * Sử dụng Locking để chống bấm trùng xác nhận 2 lần
   */
  async confirmReceipt(receiptId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Locking phiếu nhập để tránh Race Condition xác nhận cùng lúc
      const receipt = await queryRunner.manager.findOne(StockReceipt, {
        where: { id: receiptId },
        relations: ['items', 'items.ingredient'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!receipt) {
        throw new NotFoundException('Không tìm thấy phiếu nhập kho.');
      }

      if (receipt.status !== StockReceiptStatus.DRAFT) {
        throw new BadRequestException('Phiếu nhập đã được xác nhận hoặc hủy bỏ trước đó.');
      }

      receipt.status = StockReceiptStatus.CONFIRMED;
      await queryRunner.manager.save(receipt);

      for (const item of receipt.items) {
        const batchNumber = `BAT-${receipt.code}-${item.id.slice(0, 4)}`.toUpperCase();

        const batch = queryRunner.manager.create(InventoryBatch, {
          batchNumber,
          ingredientId: item.ingredientId,
          receiptItemId: item.id,
          initialQuantity: item.quantity,
          currentQuantity: item.quantity,
          unitCost: item.unitPrice,
          expiryDate: item.expirationDate,
          status: BatchStatus.ACTIVE,
        });

        const savedBatch = await queryRunner.manager.save(batch);

        // Cập nhật tồn kho tổng nguyên liệu
        const ingredient = await queryRunner.manager.findOne(Ingredient, {
          where: { id: item.ingredientId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!ingredient) {
          throw new NotFoundException(`Không tìm thấy nguyên liệu ID ${item.ingredientId}`);
        }

        const newStock = Number(ingredient.currentStock) + Number(item.quantity);
        ingredient.currentStock = newStock;
        await queryRunner.manager.save(ingredient);

        // Ghi vết giao dịch kho
        const tx = queryRunner.manager.create(InventoryTransaction, {
          ingredientId: ingredient.id,
          batchId: savedBatch.id,
          type: TransactionType.IMPORT,
          quantityChange: item.quantity,
          balanceAfter: newStock,
          referenceType: 'STOCK_RECEIPT',
          referenceId: receipt.id,
        });

        await queryRunner.manager.save(tx);
      }

      await queryRunner.commitTransaction();
      return this.findOne(receiptId);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}