import { IsInt } from 'class-validator';

export class UpdateStockDto {
  @IsInt()
  delta: number; // Puede ser positivo (entrada) o negativo (salida)
}


