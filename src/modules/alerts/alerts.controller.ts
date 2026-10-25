import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get('low-stock')
  getLowStock() {
    return this.alertsService.getLowStockIngredients();
  }

  @Get('expiring-batches')
  getExpiringBatches(@Query('days') days?: number) {
    return this.alertsService.getExpiringBatches(days ? Number(days) : 30);
  }
}