import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import Empleado from '../empleados/entities/empleado.entity';
import Rol from '../empleados/entities/rol.entity';
import { EmpleadosService } from '../empleados/empleados.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'la-esperanza-secret',
      signOptions: { expiresIn: '8h' },
    }),
    TypeOrmModule.forFeature([Empleado, Rol])
  ],
  providers: [AuthService, JwtStrategy, EmpleadosService],
  controllers: [AuthController],
})
export class AuthModule {}


