import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Producto from './entities/producto.entity';
import Categoria from '../categorias/entities/categoria.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
  ) {}

  async findAll(includeInactive = false) {
    return this.productoRepo.find({
      where: includeInactive ? {} : { disponible: true },
      relations: ['categoria'],
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number) {
    const producto = await this.productoRepo.findOne({
      where: { id },
      relations: ['categoria'],
    });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return producto;
  }

  async create(dto: CreateProductoDto) {
    const categoria = await this.categoriaRepo.findOne({
      where: { id: dto.categoriaId, disponible: true },
    });
    if (!categoria) {
      throw new BadRequestException('Categoría inválida');
    }
    const existing = await this.productoRepo.findOne({ where: { nombre: dto.nombre } });
    if (existing) {
      throw new BadRequestException('El producto ya existe');
    }
    const producto = this.productoRepo.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      precio: dto.precio,
      stock: dto.stock,
      categoria_id: dto.categoriaId,
    });
    const saved = await this.productoRepo.save(producto);
    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateProductoDto) {
    const producto = await this.findOne(id);
    if (dto.nombre && dto.nombre !== producto.nombre) {
      const exists = await this.productoRepo.findOne({ where: { nombre: dto.nombre } });
      if (exists) {
        throw new BadRequestException('El producto ya existe');
      }
      producto.nombre = dto.nombre;
    }
    if (dto.descripcion !== undefined) {
      producto.descripcion = dto.descripcion;
    }
    if (dto.precio !== undefined) {
      producto.precio = dto.precio;
    }
    if (dto.stock !== undefined) {
      producto.stock = dto.stock;
    }
    if (dto.categoriaId !== undefined && dto.categoriaId !== producto.categoria_id) {
      const categoria = await this.categoriaRepo.findOne({
        where: { id: dto.categoriaId, disponible: true },
      });
      if (!categoria) {
        throw new BadRequestException('Categoría inválida');
      }
      producto.categoria_id = dto.categoriaId;
    }
    if (dto.disponible !== undefined) {
      producto.disponible = dto.disponible;
    }
    await this.productoRepo.save(producto);
    return this.findOne(producto.id);
  }

  async softDelete(id: number) {
    const producto = await this.findOne(id);
    producto.disponible = false;
    await this.productoRepo.save(producto);
    return this.findOne(producto.id);
  }

  async adjustStock(id: number, dto: UpdateStockDto) {
    const producto = await this.findOne(id);
    const nuevo = (producto.stock ?? 0) + dto.delta;
    if (nuevo < 0) {
      throw new BadRequestException('El stock no puede ser negativo');
    }
    producto.stock = nuevo;
    await this.productoRepo.save(producto);
    return this.findOne(producto.id);
  }
}
