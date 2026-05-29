import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MinLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum Role {
  CLIENTE = 'CLIENTE',
  PROVEEDOR = 'PROVEEDOR',
}

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class RegisterDto {
  @ApiProperty({ example: 'usuario@demo.com' })
  @IsEmail({}, { message: 'Correo electrónico inválido' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({ example: 'Juan Pérez', minLength: 2 })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @Transform(trim)
  name: string;

  @ApiPropertyOptional({ enum: Role, default: Role.CLIENTE })
  @IsOptional()
  @IsEnum(Role, { message: 'Rol inválido' })
  role?: Role;

  @ApiPropertyOptional({ description: 'Teléfono — solo dígitos, 10 caracteres', example: '9511234567' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10}$/, { message: 'El teléfono debe tener exactamente 10 dígitos' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Descripción profesional (solo proveedores)' })
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  @Transform(trim)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  serviceType?: string[];

  // ── Address fields ────────────────────────────────────────────────────────

  @ApiPropertyOptional({ example: 'Calle Reforma' })
  @IsOptional()
  @IsString()
  @Transform(trim)
  street?: string;

  @ApiPropertyOptional({ example: '120' })
  @IsOptional()
  @IsString()
  @Transform(trim)
  extNumber?: string;

  @ApiPropertyOptional({ example: 'Oaxaca' })
  @IsOptional()
  @IsString()
  @Transform(trim)
  state?: string;

  @ApiPropertyOptional({ example: 'Oaxaca de Juárez' })
  @IsOptional()
  @IsString()
  @Transform(trim)
  city?: string;

  @ApiPropertyOptional({ example: '68000' })
  @IsOptional()
  @IsString()
  @Length(5, 5, { message: 'El código postal debe tener 5 dígitos' })
  @Matches(/^\d{5}$/, { message: 'El código postal debe ser numérico de 5 dígitos' })
  zipCode?: string;
}
