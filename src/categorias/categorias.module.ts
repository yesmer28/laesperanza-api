import { Module } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CategoriasController } from './categorias.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Categoria from './entities/categoria.entity';

@Module({
  providers: [CategoriasService],
  controllers: [CategoriasController],
  imports: [TypeOrmModule.forFeature([Categoria])]
})
export class CategoriasModule {}
