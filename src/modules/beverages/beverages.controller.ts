import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BeveragesService } from './beverages.service';
import { CreateBeverageDto } from './dto/create-beverage.dto';
import { UpdateBeverageDto } from './dto/update-beverage.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoleEnum } from '../../common/enums/system.enum';

@Controller('api/beverages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BeveragesController {
  constructor(private readonly beveragesService: BeveragesService) {}

  @Post()
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.WAREHOUSE_MANAGER)
  create(@Body() dto: CreateBeverageDto) {
    return this.beveragesService.create(dto);
  }

  @Get()
  findAll() {
    return this.beveragesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.beveragesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.WAREHOUSE_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateBeverageDto) {
    return this.beveragesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRoleEnum.ADMIN)
  remove(@Param('id') id: string) {
    return this.beveragesService.remove(id);
  }
}