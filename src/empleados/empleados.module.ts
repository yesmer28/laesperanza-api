import { Module } from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import { EmpleadosController } from './empleados.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Empleado from './entities/empleado.entity';
import Rol from './entities/rol.entity';

@Module({
  providers: [EmpleadosService],
  controllers: [EmpleadosController],
  imports: [TypeOrmModule.forFeature([Empleado, Rol])]
})
export class EmpleadosModule {}
