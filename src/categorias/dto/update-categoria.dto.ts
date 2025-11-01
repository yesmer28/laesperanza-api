import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCategoriaDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsBoolean()
  @IsOptional()
  disponible?: boolean;
}

