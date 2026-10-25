import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  getSummary() {
    return this.reportsService.getDashboardSummary();
  }

  @Get('transactions')
  getTransactions() {
    return this.reportsService.getTransactionHistory();
  }
}