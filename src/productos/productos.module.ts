import { Module } from '@nestjs/common';
import { ProductosController } from './productos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Producto from './entities/producto.entity';
import Categoria from 'src/categorias/entities/categoria.entity'; 
import { ProductosService } from './productos.service';

@Module({
  controllers: [ProductosController],
  imports: [TypeOrmModule.forFeature([Producto, Categoria])],
  providers: [ProductosService]
})
export class ProductosModule {}
