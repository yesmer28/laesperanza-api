import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly service: CategoriasService) {}

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
  create(@Body() dto: CreateCategoriaDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoriaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.softDelete(id);
  }
}
