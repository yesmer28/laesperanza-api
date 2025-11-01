import { IsInt, Min } from 'class-validator';

export class AsignarVendedorDto {
  @IsInt()
  @Min(1)
  vendedorId: number;
}

