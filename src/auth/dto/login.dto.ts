import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  usuario: string;

  @IsString()
  @MinLength(4)
  password: string;
}


