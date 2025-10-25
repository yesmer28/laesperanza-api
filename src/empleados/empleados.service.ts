import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Empleado from './entities/empleado.entity';
import Rol from './entities/rol.entity';
import * as bcrypt from 'bcrypt';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado) private readonly empleadoRepo: Repository<Empleado>,
    @InjectRepository(Rol) private readonly rolRepo: Repository<Rol>,
  ) {}

  async findAll(includeInactive = false) {
    return this.empleadoRepo.find({
      where: includeInactive ? {} : { disponible: true },
      relations: ['rol'],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const emp = await this.empleadoRepo.findOne({ where: { id }, relations: ['rol'] });
    if (!emp) throw new NotFoundException('Empleado no encontrado');
    return emp;
  }

  async create(dto: CreateEmpleadoDto) {
    const role = await this.rolRepo.findOne({ where: { rol: dto.rol } });
    if (!role) throw new BadRequestException('Rol inválido');
    const existing = await this.empleadoRepo.findOne({ where: { usuario: dto.usuario } });
    if (existing) throw new BadRequestException('El usuario ya existe');
    const hashed = await bcrypt.hash(dto.password, 10);
    const empleado = this.empleadoRepo.create({
      nombres: dto.nombres,
      apellidos: dto.apellidos,
      usuario: dto.usuario,
      cntrsna: hashed,
      telefono: dto.telefono,
      direccion: dto.direccion ?? '',
      rol_id: role.id,
    });
    return this.empleadoRepo.save(empleado);
  }

  async update(id: number, dto: UpdateEmpleadoDto) {
    const emp = await this.findOne(id);
    if (dto.usuario && dto.usuario !== emp.usuario) {
      const exists = await this.empleadoRepo.findOne({ where: { usuario: dto.usuario } });
      if (exists) throw new BadRequestException('El usuario ya existe');
    }
    if (dto.rol) {
      const role = await this.rolRepo.findOne({ where: { rol: dto.rol } });
      if (!role) throw new BadRequestException('Rol inválido');
      emp.rol_id = role.id;
    }
    if (dto.password) {
      emp.cntrsna = await bcrypt.hash(dto.password, 10);
    }
    if (dto.nombres !== undefined) emp.nombres = dto.nombres;
    if (dto.apellidos !== undefined) emp.apellidos = dto.apellidos;
    if (dto.usuario !== undefined) emp.usuario = dto.usuario;
    if (dto.telefono !== undefined) emp.telefono = dto.telefono;
    if (dto.direccion !== undefined) emp.direccion = dto.direccion;
    if (dto.disponible !== undefined) emp.disponible = dto.disponible;
    return this.empleadoRepo.save(emp);
  }

  async softDelete(id: number) {
    const emp = await this.findOne(id);
    emp.disponible = false;
    return this.empleadoRepo.save(emp);
  }
}
