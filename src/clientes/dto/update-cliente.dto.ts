import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class UpdateClienteDto {
  @IsString()
  @IsOptional()
  pulperia?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  nombres?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  apellidos?: string;

  @IsString()
  @IsOptional()
  @Length(8, 15, { message: 'El teléfono debe tener entre 8 y 15 dígitos' })
  telefono?: string;

  @IsString()
  @IsOptional()
  direccion?: string;
}
