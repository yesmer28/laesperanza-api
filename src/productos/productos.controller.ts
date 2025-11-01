import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('productos')
export class ProductosController {
  constructor(private readonly service: ProductosService) {}

  @Get()
  @Roles('ADMIN', 'VENDEDOR', 'FACTURADOR')
  findAll(@Query('includeInactive') includeInactive?: string) {
    const flag = includeInactive === 'true';
    return this.service.findAll(flag);
  }

  @Get(':id')
  @Roles('ADMIN', 'VENDEDOR', 'FACTURADOR')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateProductoDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductoDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/stock')
  @Roles('ADMIN')
  adjustStock(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStockDto) {
    return this.service.adjustStock(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.softDelete(id);
  }
}
