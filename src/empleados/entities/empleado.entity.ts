import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Rol from "./rol.entity";
import Pedido from "src/pedidos/entities/pedido.entity";

@Entity('empleado')
export default class Empleado {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombres: string;

    @Column()
    apellidos: string;

    @Column()
    usuario: string;

    @Column()
    cntrsna: string;

    @Column({length: 8})
    telefono: string;

    @Column()
    direccion: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fechaRegistro: Date;

    @Column({ default: true })
    disponible: boolean;

    @Column()
    rol_id: number;

    @ManyToOne(() => Rol, (rol) => rol.id)
    @JoinColumn({ name: 'rol_id' })
    rol: Rol;

    @OneToMany(() => Pedido, (pedido) => pedido.pre_vendedor)
    pre_vendedor: Pedido[];

    @OneToMany(() => Pedido, (pedido) => pedido.vendedor)
    vendedor: Pedido[];
}
