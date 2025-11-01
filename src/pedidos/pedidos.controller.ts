import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { AsignarVendedorDto } from './dto/asignar-vendedor.dto';
import { ActualizarDetalleDto } from './dto/actualizar-detalle.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly service: PedidosService) {}

  @Get()
  @Roles('ADMIN', 'FACTURADOR')
  findAll() {
    return this.service.findAll();
  }

  @Get('mis-pendientes')
  @Roles('VENDEDOR')
  findMyPending(@Request() req: any) {
    return this.service.findPendingForVendedor(req.user.sub);
  }

  @Get(':id')
  @Roles('ADMIN', 'FACTURADOR', 'VENDEDOR')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const pedido = await this.service.findOne(id);
    if (req.user.rol === 'VENDEDOR' && pedido.vendedor_id !== req.user.sub && pedido.pre_vendedor_id !== req.user.sub) {
      throw new ForbiddenException('No puede ver este pedido');
    }
    return pedido;
  }

  @Post()
  @Roles('ADMIN', 'FACTURADOR', 'VENDEDOR')
  create(@Body() dto: CreatePedidoDto, @Request() req: any) {
    return this.service.create(dto, req.user.sub);
  }

  @Patch(':id/cancelar')
  @Roles('ADMIN', 'FACTURADOR')
  cancel(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.service.cancel(id, req.user.rol);
  }

  @Patch(':id/entregar')
  @Roles('ADMIN', 'VENDEDOR')
  async entregar(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    if (req.user.rol === 'VENDEDOR') {
      const pedido = await this.service.findOne(id);
      if (pedido.vendedor_id !== req.user.sub) {
        throw new ForbiddenException('No puede entregar este pedido');
      }
    }
    return this.service.markAsDelivered(id);
  }

  @Patch(':id/detalle/:detalleId')
  @Roles('VENDEDOR')
  actualizarDetalle(
    @Param('id', ParseIntPipe) id: number,
    @Param('detalleId', ParseIntPipe) detalleId: number,
    @Body() dto: ActualizarDetalleDto,
    @Request() req: any,
  ) {
    return this.service.markDetalles(id, detalleId, dto, req.user.sub);
  }

  @Patch(':id/rechazar')
  @Roles('VENDEDOR')
  rechazarPedido(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.service.rechazar(id, req.user.sub);
  }

  @Patch(':id/vendedor')
  @Roles('ADMIN')
  assignVendedor(@Param('id', ParseIntPipe) id: number, @Body() dto: AsignarVendedorDto) {
    return this.service.assignVendedor(id, dto);
  }
}
