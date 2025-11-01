import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty()
  pulperia: string;

  @IsString()
  @IsNotEmpty()
  propietario: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 15, { message: 'El teléfono debe tener entre 8 y 15 dígitos' })
  telefono: string;

  @IsString()
  @IsNotEmpty()
  direccion: string;
}
