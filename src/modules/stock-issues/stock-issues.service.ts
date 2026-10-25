import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThan } from 'typeorm';
import { StockIssue } from './entities/stock-issue.entity';
import { StockIssueItem } from './entities/stock-issue-item.entity';
import { InventoryBatch } from '../inventory/entities/inventory-batch.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { InventoryTransaction } from '../inventory/entities/inventory-transaction.entity';
import { CreateStockIssueDto } from './dto/create-stock-issue.dto';
import { StockIssueStatus, BatchStatus, TransactionType } from '../../common/enums/system.enum';

@Injectable()
export class StockIssuesService {
  constructor(
    @InjectRepository(StockIssue)
    private readonly issueRepository: Repository<StockIssue>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll() {
    return this.issueRepository.find({
      relations: ['creator', 'items', 'items.batch', 'items.batch.ingredient'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const issue = await this.issueRepository.findOne({
      where: { id },
      relations: ['creator', 'items', 'items.batch', 'items.batch.ingredient'],
    });
    if (!issue) {
      throw new NotFoundException('Không tìm thấy phiếu xuất kho.');
    }
    return issue;
  }

  /**
   * TẠO PHIẾU XUẤT KHO VỚI THUẬT TOÁN FEFO & PESSIMISTIC LOCKING
   * Ưu tiên xuất các Lô hàng gần hết hạn trước. Chống xung đột dữ liệu đồng thời.
   */
  async create(dto: CreateStockIssueDto, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const code = `EXP-${Date.now().toString().slice(-8)}`;
      const issue = queryRunner.manager.create(StockIssue, {
        code,
        reason: dto.reason,
        createdBy: userId,
        status: StockIssueStatus.COMPLETED,
      });

      const savedIssue = await queryRunner.manager.save(issue);
      const now = new Date();

      for (const itemReq of dto.items) {
        const ingredient = await queryRunner.manager.findOne(Ingredient, {
          where: { id: itemReq.ingredientId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!ingredient) {
          throw new NotFoundException(`Nguyên liệu ID ${itemReq.ingredientId} không tồn tại.`);
        }

        // 1. Lấy danh sách các Lô hàng còn Hạn SD & Còn hàng, sắp xếp FEFO (ExpiryDate ASC)
        const availableBatches = await queryRunner.manager.find(InventoryBatch, {
          where: {
            ingredientId: itemReq.ingredientId,
            status: BatchStatus.ACTIVE,
            expiryDate: MoreThan(now),
          },
          order: { expiryDate: 'ASC' },
          lock: { mode: 'pessimistic_write' }, // Khoá dòng các lô hàng đang chọn
        });

        // 2. Kiểm tra tổng số lượng khả dụng
        const totalAvailable = availableBatches.reduce(
          (sum, b) => sum + Number(b.currentQuantity),
          0,
        );

        if (totalAvailable < itemReq.quantity) {
          throw new BadRequestException(
            `Tồn kho khả dụng của nguyên liệu '${ingredient.name}' không đủ. Cần xuất: ${itemReq.quantity} ${ingredient.baseUnit}, khả dụng: ${totalAvailable} ${ingredient.baseUnit}.`,
          );
        }

        // 3. Phân bổ trừ số lượng từng Lô theo FEFO
        let remainingToDeduct = itemReq.quantity;

        for (const batch of availableBatches) {
          if (remainingToDeduct <= 0) break;

          const currentQty = Number(batch.currentQuantity);
          const deductQty = Math.min(remainingToDeduct, currentQty);

          batch.currentQuantity = currentQty - deductQty;
          if (batch.currentQuantity === 0) {
            batch.status = BatchStatus.DEPLETED;
          }

          await queryRunner.manager.save(batch);

          // Lưu Chi tiết Phiếu Xuất
          const issueItem = queryRunner.manager.create(StockIssueItem, {
            issueId: savedIssue.id,
            batchId: batch.id,
            quantity: deductQty,
          });
          await queryRunner.manager.save(issueItem);

          // Cập nhật tồn kho tổng Ingredient
          const newIngredientStock = Number(ingredient.currentStock) - deductQty;
          ingredient.currentStock = newIngredientStock;
          await queryRunner.manager.save(ingredient);

          // Ghi Log Transaction
          const tx = queryRunner.manager.create(InventoryTransaction, {
            ingredientId: ingredient.id,
            batchId: batch.id,
            type: TransactionType.EXPORT,
            quantityChange: -deductQty,
            balanceAfter: newIngredientStock,
            referenceType: 'STOCK_ISSUE',
            referenceId: savedIssue.id,
          });
          await queryRunner.manager.save(tx);

          remainingToDeduct -= deductQty;
        }
      }

      await queryRunner.commitTransaction();
      return this.findOne(savedIssue.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * HỦY PHIẾU XUẤT KHO (REVERSAL TRANSACTION)
   * Hoàn trả lại số lượng xuất vào đúng các Lô hàng ban đầu
   */
  async cancelIssue(issueId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const issue = await queryRunner.manager.findOne(StockIssue, {
        where: { id: issueId },
        relations: ['items', 'items.batch', 'items.batch.ingredient'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!issue) {
        throw new NotFoundException('Không tìm thấy phiếu xuất kho.');
      }

      if (issue.status === StockIssueStatus.CANCELLED) {
        throw new BadRequestException('Phiếu xuất kho này đã bị hủy trước đó.');
      }

      issue.status = StockIssueStatus.CANCELLED;
      await queryRunner.manager.save(issue);

      for (const item of issue.items) {
        const batch = await queryRunner.manager.findOne(InventoryBatch, {
          where: { id: item.batchId },
          lock: { mode: 'pessimistic_write' },
        });

        if (batch) {
          batch.currentQuantity = Number(batch.currentQuantity) + Number(item.quantity);
          if (batch.status === BatchStatus.DEPLETED && batch.currentQuantity > 0) {
            batch.status = BatchStatus.ACTIVE;
          }
          await queryRunner.manager.save(batch);
        }

        const ingredient = await queryRunner.manager.findOne(Ingredient, {
          where: { id: item.batch.ingredientId },
          lock: { mode: 'pessimistic_write' },
        });

        if (ingredient) {
          const newStock = Number(ingredient.currentStock) + Number(item.quantity);
          ingredient.currentStock = newStock;
          await queryRunner.manager.save(ingredient);

          const tx = queryRunner.manager.create(InventoryTransaction, {
            ingredientId: ingredient.id,
            batchId: batch ? batch.id : null,
            type: TransactionType.CANCEL_EXPORT,
            quantityChange: item.quantity,
            balanceAfter: newStock,
            referenceType: 'STOCK_ISSUE_CANCEL',
            referenceId: issue.id,
          });
          await queryRunner.manager.save(tx);
        }
      }

      await queryRunner.commitTransaction();
      return this.findOne(issueId);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}