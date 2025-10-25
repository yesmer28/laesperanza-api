import { Module } from '@nestjs/common';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Pedido from './entities/pedido.entity';
import DetallePedido from './entities/detalle_pedido.entity';

@Module({
  controllers: [PedidosController],
  providers: [PedidosService],
  imports: [TypeOrmModule.forFeature([Pedido, DetallePedido])]
})
export class PedidosModule {}
