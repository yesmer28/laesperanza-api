import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Categoria from "src/categorias/entities/categoria.entity";
import DetallePedido from "src/pedidos/entities/detalle_pedido.entity";

@Entity('producto')
export default class Producto {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column()
    descripcion: string;

    @Column()
    precio: number;

    @Column()
    categoria_id: number;

    @Column()
    stock: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fechaRegistro: Date;

    @Column({ default: true })
    disponible: boolean;

    @ManyToOne(() => Categoria, (categoria) => categoria.productos)
    @JoinColumn({ name: 'categoria_id' })
    categoria: Categoria;

    @OneToMany(() => DetallePedido, (detalle) => detalle.producto)
    detalle_pedidos: DetallePedido[];
}