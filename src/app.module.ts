import { Module } from '@nestjs/common';
import { EmpleadosModule } from './empleados/empleados.module';
import { ClientesModule } from './clientes/clientes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosService } from './productos/productos.service';
import { ProductosModule } from './productos/productos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { AuthModule } from './auth/auth.module';
import {config } from 'dotenv';
config();


@Module({
  imports: [
    EmpleadosModule,
    ClientesModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'yesmer',
      autoLoadEntities: true,
      synchronize: true,
      database: process.env.DB_NAME
    }),
    ProductosModule,
    CategoriasModule,
    PedidosModule,
    AuthModule,
  ],
  controllers: [],
  providers: [ProductosService],
})
export class AppModule { }
