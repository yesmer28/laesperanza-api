import { IsIn, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class CreateEmpleadoDto {
  @IsString()
  nombres: string;

  @IsString()
  apellidos: string;

  @IsString()
  usuario: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsString()
  @Length(8, 8)
  telefono: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsIn(['VENDEDOR', 'FACTURADOR'])
  rol: 'VENDEDOR' | 'FACTURADOR';
}


