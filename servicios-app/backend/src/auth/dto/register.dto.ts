import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum Role {
  CLIENTE = 'CLIENTE',
  PROVEEDOR = 'PROVEEDOR',
}

export class RegisterDto {
  @ApiProperty({ example: 'usuario@demo.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({ example: 'Juan Pérez', minLength: 2 })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name: string;

  @ApiPropertyOptional({ enum: Role, default: Role.CLIENTE })
  @IsOptional()
  @IsEnum(Role, { message: 'Rol inválido' })
  role?: Role;

  @ApiPropertyOptional({ example: '+52 1 234 567 8900' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Plomero con 10 años de experiencia' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: ['PLOMERIA', 'ELECTRICIDAD'] })
  @IsOptional()
  serviceType?: string[];
}
