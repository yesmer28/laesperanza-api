import Producto from "src/productos/entities/producto.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Pedido from "./pedido.entity";


@Entity('detalle_pedido')
export default class DetallePedido {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'int'})
    cantidad: number;

    @Column({type: 'float'})
    precio_unitario: number;

    @Column({type: 'float'})
    subtotal: number;

    @Column({ type: 'enum', enum: ['PENDIENTE', 'ENTREGADO', 'RECHAZADO'], default: 'PENDIENTE' })
    estado: 'PENDIENTE' | 'ENTREGADO' | 'RECHAZADO';

    @Column({ type: 'text', nullable: true })
    comentario?: string;

    @Column()
    pedido_id: number;

    @Column()
    producto_id: number;

    @ManyToOne(() => Pedido, (pedido) => pedido.detalle_pedidos)
    @JoinColumn({ name: 'pedido_id' })
    pedido: Pedido;

    @ManyToOne(() => Producto, (producto) => producto.detalle_pedidos)
    @JoinColumn({ name: 'producto_id' })
    producto: Producto;
}
