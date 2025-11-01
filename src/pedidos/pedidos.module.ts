import { Module } from '@nestjs/common';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Pedido from './entities/pedido.entity';
import DetallePedido from './entities/detalle_pedido.entity';
import Producto from '../productos/entities/producto.entity';
import Cliente from '../clientes/entities/cliente.entity';
import Empleado from '../empleados/entities/empleado.entity';

@Module({
  controllers: [PedidosController],
  providers: [PedidosService],
  imports: [TypeOrmModule.forFeature([Pedido, DetallePedido, Producto, Cliente, Empleado])]
})
export class PedidosModule {}
