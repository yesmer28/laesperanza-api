import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Empleado from '../empleados/entities/empleado.entity';
import Rol from '../empleados/entities/rol.entity';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Empleado) private readonly empleadoRepo: Repository<Empleado>,
    @InjectRepository(Rol) private readonly rolRepo: Repository<Rol>,
  ) {}

  async onModuleInit() {
    await this.ensureSeedRolesAndAdmin();
  }

  private async ensureSeedRolesAndAdmin() {
    const roleNames = ['ADMIN', 'VENDEDOR', 'FACTURADOR'];
    for (const name of roleNames) {
      const exists = await this.rolRepo.findOne({ where: { rol: name } });
      if (!exists) {
        await this.rolRepo.save(this.rolRepo.create({ rol: name }));
      }
    }

    const adminRole = await this.rolRepo.findOne({ where: { rol: 'ADMIN' } });
    const existingAdmin = await this.empleadoRepo.findOne({ where: { usuario: 'admin' } });
    if (!existingAdmin) {
      const hashed = await bcrypt.hash('admin123', 10);
      const admin = this.empleadoRepo.create({
        nombres: 'Admin',
        apellidos: 'Principal',
        usuario: 'admin',
        cntrsna: hashed,
        telefono: '00000000',
        direccion: '',
        rol_id: adminRole!.id,
      });
      await this.empleadoRepo.save(admin);
    }
  }

  async login(dto: LoginDto) {
    const user = await this.empleadoRepo.findOne({ where: { usuario: dto.usuario }, relations: ['rol'] });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    const ok = await bcrypt.compare(dto.password, user.cntrsna);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');
    const payload = { sub: user.id, usuario: user.usuario, rol: user.rol.rol };
    const token = await this.jwtService.signAsync(payload);
    return {
      access_token: token,
      user: {
        id: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        usuario: user.usuario,
        rol: user.rol.rol,
      },
    };
  }

  async me(userId: number) {
    const user = await this.empleadoRepo.findOne({ where: { id: userId }, relations: ['rol'] });
    if (!user) throw new UnauthorizedException();
    return {
      id: user.id,
      nombres: user.nombres,
      apellidos: user.apellidos,
      usuario: user.usuario,
      rol: user.rol.rol,
    };
  }

  async createUser(dto: CreateUserDto) {
    if (dto.rol === 'ADMIN') {
      throw new BadRequestException('No se permite crear usuarios ADMIN desde el sistema');
    }
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
      direccion: dto.direccion,
      rol_id: role.id,
    });
    const saved = await this.empleadoRepo.save(empleado);
    return { id: saved.id };
  }
}


