import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProductoDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @IsOptional()
  precio?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  categoriaId?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsBoolean()
  @IsOptional()
  disponible?: boolean;
}

