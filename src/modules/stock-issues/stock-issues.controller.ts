import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { StockIssuesService } from './stock-issues.service';
import { CreateStockIssueDto } from './dto/create-stock-issue.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRoleEnum } from '../../common/enums/system.enum';
import { User } from '../users/entities/user.entity';

@Controller('api/stock-issues')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockIssuesController {
  constructor(private readonly stockIssuesService: StockIssuesService) {}

  @Post()
  create(@Body() dto: CreateStockIssueDto, @CurrentUser() user: User) {
    return this.stockIssuesService.create(dto, user.id);
  }

  @Get()
  findAll() {
    return this.stockIssuesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockIssuesService.findOne(id);
  }

  @Post(':id/cancel')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.WAREHOUSE_MANAGER)
  cancelIssue(@Param('id') id: string) {
    return this.stockIssuesService.cancelIssue(id);
  }
}