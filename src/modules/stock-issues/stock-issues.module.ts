import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockIssue } from './entities/stock-issue.entity';
import { StockIssueItem } from './entities/stock-issue-item.entity';
import { StockIssuesService } from './stock-issues.service';
import { StockIssuesController } from './stock-issues.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StockIssue, StockIssueItem])],
  controllers: [StockIssuesController],
  providers: [StockIssuesService],
  exports: [StockIssuesService],
})
export class StockIssuesModule {}