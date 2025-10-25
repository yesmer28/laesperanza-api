import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @IsOptional()
  pulperia?: string;

  @IsString()
  @IsNotEmpty()
  nombres: string;

  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 15, { message: 'El teléfono debe tener entre 8 y 15 dígitos' })
  telefono: string;

  @IsString()
  @IsOptional()
  direccion?: string;
}
