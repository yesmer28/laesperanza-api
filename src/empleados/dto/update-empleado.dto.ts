import { IsBoolean, IsIn, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class UpdateEmpleadoDto {
  @IsString()
  @IsOptional()
  nombres?: string;

  @IsString()
  @IsOptional()
  apellidos?: string;

  @IsString()
  @IsOptional()
  usuario?: string;

  @IsString()
  @IsOptional()
  @MinLength(4)
  password?: string;

  @IsString()
  @IsOptional()
  @Length(8, 8)
  telefono?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsIn(['VENDEDOR', 'FACTURADOR'])
  @IsOptional()
  rol?: 'VENDEDOR' | 'FACTURADOR';

  @IsBoolean()
  @IsOptional()
  disponible?: boolean;
}


