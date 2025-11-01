import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  Min,
  ValidateNested,
} from 'class-validator';

class PedidoItemDto {
  @IsInt()
  @Min(1)
  productoId: number;

  @IsInt()
  @Min(1)
  cantidad: number;
}

export class CreatePedidoDto {
  @IsInt()
  @Min(1)
  clienteId: number;

  @IsInt()
  @Min(1)
  vendedorId: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PedidoItemDto)
  items: PedidoItemDto[];
}

export { PedidoItemDto };

