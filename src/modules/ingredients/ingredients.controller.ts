import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { QueryIngredientDto } from './dto/query-ingredient.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoleEnum } from '../../common/enums/system.enum';

@Controller('api/ingredients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.WAREHOUSE_MANAGER)
  create(@Body() dto: CreateIngredientDto) {
    return this.ingredientsService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryIngredientDto) {
    return this.ingredientsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ingredientsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.WAREHOUSE_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateIngredientDto) {
    return this.ingredientsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRoleEnum.ADMIN)
  remove(@Param('id') id: string) {
    return this.ingredientsService.remove(id);
  }
}