import Pedido from "src/pedidos/entities/pedido.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity('cliente')
export default class Cliente {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombres: string;

    @Column()
    apellidos: string;

    @Column({nullable: true})
    pulperia?: string;

    @Column({length: 15})
    telefono: string;

    @Column({ nullable: true })
    direccion?: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fechaRegistro: Date;

    @Column({ default: true })
    disponible: boolean;

    @OneToMany(() => Pedido, (pedido) => pedido.cliente)
    pedidos: Pedido[];
}