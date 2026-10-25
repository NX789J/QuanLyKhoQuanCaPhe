import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { StockReceiptsService } from './stock-receipts.service';
import { CreateStockReceiptDto } from './dto/create-stock-receipt.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRoleEnum } from '../../common/enums/system.enum';
import { User } from '../users/entities/user.entity';

@Controller('api/stock-receipts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockReceiptsController {
  constructor(private readonly stockReceiptsService: StockReceiptsService) {}

  @Post()
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.WAREHOUSE_MANAGER)
  create(@Body() dto: CreateStockReceiptDto, @CurrentUser() user: User) {
    return this.stockReceiptsService.create(dto, user.id);
  }

  @Get()
  findAll() {
    return this.stockReceiptsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockReceiptsService.findOne(id);
  }

  @Post(':id/confirm')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.WAREHOUSE_MANAGER)
  confirmReceipt(@Param('id') id: string) {
    return this.stockReceiptsService.confirmReceipt(id);
  }
}