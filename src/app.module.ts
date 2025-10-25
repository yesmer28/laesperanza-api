import { Module } from '@nestjs/common';
import { EmpleadosModule } from './empleados/empleados.module';
import { ClientesModule } from './clientes/clientes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosService } from './productos/productos.service';
import { ProductosModule } from './productos/productos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    EmpleadosModule, 
    ClientesModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'yesmer28',
      autoLoadEntities: true,
      synchronize: true,
      database: 'la_esperanza',
    }),
    ProductosModule,
    CategoriasModule,
    PedidosModule,
    AuthModule,
  ],
  controllers: [],
  providers: [ProductosService],
})
export class AppModule {}
