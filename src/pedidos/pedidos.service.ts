import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Pedido from './entities/pedido.entity';
import DetallePedido from './entities/detalle_pedido.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { AsignarVendedorDto } from './dto/asignar-vendedor.dto';
import { ActualizarDetalleDto } from './dto/actualizar-detalle.dto';
import Producto from '../productos/entities/producto.entity';
import Cliente from '../clientes/entities/cliente.entity';
import Empleado from '../empleados/entities/empleado.entity';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,
    @InjectRepository(DetallePedido)
    private readonly detalleRepo: Repository<DetallePedido>,
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(Empleado)
    private readonly empleadoRepo: Repository<Empleado>,
  ) {}

  private readonly pedidoRelations = [
    'cliente',
    'pre_vendedor',
    'vendedor',
    'detalle_pedidos',
    'detalle_pedidos.producto',
  ];

  async findAll() {
    return this.pedidoRepo.find({
      relations: this.pedidoRelations,
      order: { fecha_pedido: 'DESC', id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const pedido = await this.pedidoRepo.findOne({
      where: { id },
      relations: this.pedidoRelations,
    });
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }
    return pedido;
  }

  async findPendingForVendedor(vendedorId: number) {
    return this.pedidoRepo.find({
      where: { vendedor_id: vendedorId, estado: 'PENDIENTE' },
      relations: this.pedidoRelations,
      order: { fecha_pedido: 'ASC', id: 'ASC' },
    });
  }

  async create(dto: CreatePedidoDto, creadorId: number) {
    const creador = await this.empleadoRepo.findOne({ where: { id: creadorId, disponible: true }, relations: ['rol'] });
    if (!creador) {
      throw new BadRequestException('Empleado inválido');
    }

    const cliente = await this.clienteRepo.findOne({ where: { id: dto.clienteId, disponible: true } });
    if (!cliente) {
      throw new BadRequestException('Cliente inválido');
    }

    const vendedorEntrega = await this.empleadoRepo.findOne({
      where: { id: dto.vendedorId, disponible: true },
      relations: ['rol'],
    });
    if (!vendedorEntrega || vendedorEntrega.rol?.rol !== 'VENDEDOR') {
      throw new BadRequestException('Vendedor de entrega inválido');
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Debe incluir al menos un producto');
    }

    const detalles: DetallePedido[] = [];
    for (const item of dto.items) {
      const producto = await this.productoRepo.findOne({
        where: { id: item.productoId, disponible: true },
      });
      if (!producto) {
        throw new BadRequestException('Producto inválido');
      }
      if (item.cantidad > producto.stock) {
        throw new BadRequestException(
          `Stock insuficiente para el producto ${producto.nombre}. Disponible: ${producto.stock}`,
        );
      }
      const subtotal = producto.precio * item.cantidad;
      const detalle = this.detalleRepo.create({
        producto_id: producto.id,
        cantidad: item.cantidad,
        precio_unitario: producto.precio,
        subtotal,
      });
      detalles.push(detalle);
    }

    const pedido = this.pedidoRepo.create({
      cliente_id: cliente.id,
      pre_vendedor_id: creador.id,
      vendedor_id: vendedorEntrega.id,
      estado: 'PENDIENTE',
    });

    const savedPedido = await this.pedidoRepo.save(pedido);
    for (const detalle of detalles) {
      detalle.pedido_id = savedPedido.id;
    }
    await this.detalleRepo.save(detalles);
    return this.findOne(savedPedido.id);
  }

  async cancel(id: number, actorRole: string) {
    const pedido = await this.findOne(id);
    if (pedido.estado !== 'PENDIENTE') {
      throw new BadRequestException('Solo se pueden cancelar pedidos pendientes');
    }
    const fechaToma = pedido.fecha_pedido instanceof Date ? pedido.fecha_pedido : new Date(pedido.fecha_pedido);
    const diffMinutes = (Date.now() - fechaToma.getTime()) / 60000;
    if (actorRole !== 'ADMIN' && diffMinutes > 30) {
      throw new BadRequestException('El pedido solo puede modificarse dentro de los primeros 30 minutos por el facturador');
    }
    pedido.estado = 'CANCELADO';
    await this.pedidoRepo.save(pedido);
    return this.findOne(id);
  }

  async markDetalles(id: number, detalleId: number, dto: ActualizarDetalleDto, actorId: number) {
    const pedido = await this.findOne(id);
    if (pedido.vendedor_id !== actorId) {
      throw new ForbiddenException('El pedido no está asignado a este vendedor');
    }
    if (pedido.estado === 'RECHAZADO') {
      throw new BadRequestException('Pedido rechazado, no se puede actualizar');
    }
    if (pedido.estado === 'ENTREGADO') {
      throw new BadRequestException('Pedido entregado, no se puede actualizar');
    }
    if (pedido.estado === 'CANCELADO') {
      throw new BadRequestException('Pedido cancelado, no se puede actualizar');
    }

    const detalle = pedido.detalle_pedidos.find((d) => d.id === detalleId);
    if (!detalle) {
      throw new NotFoundException('Detalle no encontrado');
    }
    if (detalle.estado !== 'PENDIENTE') {
      throw new BadRequestException('El detalle ya fue procesado');
    }

    if (dto.estado === 'ENTREGADO') {
      await this.productoRepo.manager.transaction(async (manager) => {
        const producto = await manager.findOne(Producto, { where: { id: detalle.producto_id } });
        if (!producto) {
          throw new NotFoundException('Producto no encontrado');
        }
        if (producto.stock < detalle.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para entregar el producto ${producto.nombre}. Disponible: ${producto.stock}`,
          );
        }
        producto.stock -= detalle.cantidad;
        await manager.save(producto);
        await manager.update(DetallePedido, detalle.id, {
          estado: 'ENTREGADO',
          comentario: dto.comentario ?? undefined,
        });
      });
    } else {
      await this.detalleRepo.update(detalle.id, {
        estado: 'RECHAZADO',
        comentario: dto.comentario ?? undefined,
      });
    }

    let refreshed = await this.findOne(id);
    const todosRechazados = refreshed.detalle_pedidos.every((d) => d.estado === 'RECHAZADO');
    if (todosRechazados && refreshed.estado !== 'RECHAZADO') {
      await this.pedidoRepo.update(id, { estado: 'RECHAZADO' });
      refreshed = await this.findOne(id);
    }
    return refreshed;
  }

  async markAsDelivered(id: number) {
    await this.productoRepo.manager.transaction(async (manager) => {
      const pedido = await manager.findOne(Pedido, {
        where: { id },
        relations: ['detalle_pedidos'],
      });
      if (!pedido) {
        throw new NotFoundException('Pedido no encontrado');
      }
      if (pedido.estado !== 'PENDIENTE') {
        throw new BadRequestException('Solo se pueden entregar pedidos pendientes');
      }

      const entregables = pedido.detalle_pedidos.filter((detalle) => detalle.estado !== 'RECHAZADO');
      if (entregables.length === 0) {
        throw new BadRequestException('No hay productos pendientes de entrega');
      }

      for (const detalle of pedido.detalle_pedidos) {
        if (detalle.estado === 'RECHAZADO') {
          continue;
        }
        if (detalle.estado === 'ENTREGADO') {
          continue;
        }
        const producto = await manager.findOne(Producto, {
          where: { id: detalle.producto_id },
        });
        if (!producto) {
          throw new NotFoundException('Producto asociado no encontrado');
        }
        if (producto.stock < detalle.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para entregar el producto ${producto.nombre}. Disponible: ${producto.stock}`,
          );
        }
        producto.stock -= detalle.cantidad;
        await manager.save(producto);
        detalle.estado = 'ENTREGADO';
        await manager.save(detalle);
      }

      pedido.estado = 'ENTREGADO';
      await manager.save(pedido);
    });
    return this.findOne(id);
  }

  async assignVendedor(id: number, dto: AsignarVendedorDto) {
    const pedido = await this.findOne(id);
    if (pedido.estado === 'ENTREGADO') {
      throw new BadRequestException('No se puede reasignar un pedido entregado');
    }
    if (pedido.estado === 'CANCELADO') {
      throw new BadRequestException('No se puede reasignar un pedido cancelado');
    }
    if (pedido.estado === 'RECHAZADO') {
      throw new BadRequestException('No se puede reasignar un pedido rechazado');
    }
    const vendedor = await this.empleadoRepo.findOne({
      where: { id: dto.vendedorId, disponible: true },
      relations: ['rol'],
    });
    if (!vendedor || vendedor.rol?.rol !== 'VENDEDOR') {
      throw new BadRequestException('Vendedor inválido');
    }
    pedido.vendedor_id = vendedor.id;
    await this.pedidoRepo.save(pedido);
    return this.findOne(id);
  }

  async rechazar(id: number, actorId: number) {
    const pedido = await this.findOne(id);
    if (pedido.vendedor_id !== actorId) {
      throw new ForbiddenException('El pedido no está asignado a este vendedor');
    }
    if (pedido.estado === 'RECHAZADO') {
      return pedido;
    }
    if (pedido.estado !== 'PENDIENTE') {
      throw new BadRequestException('Solo se pueden rechazar pedidos pendientes');
    }
    const entregados = pedido.detalle_pedidos.some((detalle) => detalle.estado === 'ENTREGADO');
    if (entregados) {
      throw new BadRequestException('El pedido ya tiene productos entregados');
    }
    await this.pedidoRepo.manager.transaction(async (manager) => {
      await manager.update(Pedido, id, { estado: 'RECHAZADO' });
      await manager.update(DetallePedido, { pedido_id: id }, { estado: 'RECHAZADO' });
    });
    return this.findOne(id);
  }
}
