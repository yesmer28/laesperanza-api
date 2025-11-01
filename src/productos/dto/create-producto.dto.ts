import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  precio: number;

  @IsInt()
  @Min(0)
  categoriaId: number;

  @IsInt()
  @Min(0)
  stock: number;
}

