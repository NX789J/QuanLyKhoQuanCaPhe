import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockReceipt } from './entities/stock-receipt.entity';
import { StockReceiptItem } from './entities/stock-receipt-item.entity';
import { StockReceiptsService } from './stock-receipts.service';
import { StockReceiptsController } from './stock-receipts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StockReceipt, StockReceiptItem])],
  controllers: [StockReceiptsController],
  providers: [StockReceiptsService],
  exports: [StockReceiptsService],
})
export class StockReceiptsModule {}