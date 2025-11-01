import { IsIn, IsOptional, IsString } from 'class-validator';

export class ActualizarDetalleDto {
  @IsIn(['ENTREGADO', 'RECHAZADO'])
  estado: 'ENTREGADO' | 'RECHAZADO';

  @IsString()
  @IsOptional()
  comentario?: string;
}

