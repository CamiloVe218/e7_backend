import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'cliente@demo.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'password123', minLength: 1 })
  @IsString()
  @MinLength(1, { message: 'La contraseña es requerida' })
  password: string;
}
