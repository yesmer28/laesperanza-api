import Cliente from "src/clientes/entities/cliente.entity";
import Empleado from "src/empleados/entities/empleado.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import DetallePedido from "./detalle_pedido.entity";

@Entity('pedido')
export default class Pedido {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: ['PENDIENTE', 'ENTREGADO', 'CANCELADO', 'RECHAZADO'], default: 'PENDIENTE' })
    estado: 'PENDIENTE' | 'ENTREGADO' | 'CANCELADO' | 'RECHAZADO';

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha_pedido: Date;

    @Column({ default: true })
    disponible: boolean;

    @Column()
    cliente_id: number;

    @Column()
    pre_vendedor_id: number;

    @Column({ nullable: true })
    vendedor_id: number;

    @ManyToOne(() => Cliente, (cliente) => cliente.pedidos)
    @JoinColumn({ name: 'cliente_id' })
    cliente: Cliente;

    @ManyToOne(() => Empleado, (empleado) => empleado.pre_vendedor)
    @JoinColumn({ name: 'pre_vendedor_id' })
    pre_vendedor: Empleado;

    @ManyToOne(() => Empleado, (empleado) => empleado.vendedor)
    @JoinColumn({ name: 'vendedor_id' })
    vendedor: Empleado;

    @OneToMany(() => DetallePedido, (detalle) => detalle.pedido)
    detalle_pedidos: DetallePedido[];
}