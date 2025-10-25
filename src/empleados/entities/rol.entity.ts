import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Empleado from "./empleado.entity";



@Entity('rol')
export default class Rol {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    rol: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fechaRegistro: Date;

    @Column({ default: true })
    disponible: boolean;

    @OneToMany(() => Empleado, (empleado) => empleado.rol_id)
    empleados: Empleado[];
}
