import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Categoria from './entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
  ) {}

  async findAll(includeInactive = false) {
    const categorias = await this.categoriaRepo.find({
      where: includeInactive ? {} : { disponible: true },
      order: { nombre: 'ASC' },
      relations: ['productos'],
    });
    for (const categoria of categorias) {
      if (categoria.productos) {
        categoria.productos = categoria.productos.filter((producto) => producto.disponible);
      }
    }
    return categorias;
  }

  async findOne(id: number) {
    const categoria = await this.categoriaRepo.findOne({
      where: { id },
      relations: ['productos'],
    });
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }
    if (categoria.productos) {
      categoria.productos = categoria.productos.filter((producto) => producto.disponible);
    }
    return categoria;
  }

  async create(dto: CreateCategoriaDto) {
    const existing = await this.categoriaRepo.findOne({ where: { nombre: dto.nombre } });
    if (existing) {
      throw new BadRequestException('La categoría ya existe');
    }
    const categoria = this.categoriaRepo.create({
      nombre: dto.nombre,
    });
    return this.categoriaRepo.save(categoria);
  }

  async update(id: number, dto: UpdateCategoriaDto) {
    const categoria = await this.findOne(id);
    if (dto.nombre && dto.nombre !== categoria.nombre) {
      const exists = await this.categoriaRepo.findOne({ where: { nombre: dto.nombre } });
      if (exists) {
        throw new BadRequestException('La categoría ya existe');
      }
      categoria.nombre = dto.nombre;
    }
    if (dto.disponible !== undefined) {
      categoria.disponible = dto.disponible;
    }
    return this.categoriaRepo.save(categoria);
  }

  async softDelete(id: number) {
    const categoria = await this.findOne(id);
    categoria.disponible = false;
    return this.categoriaRepo.save(categoria);
  }
}
