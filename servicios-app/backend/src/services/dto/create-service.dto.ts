import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Instalación de Aire Acondicionado' })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @ApiProperty({ example: 'Instalación profesional de unidades de aire acondicionado' })
  @IsString()
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  description: string;

  @ApiProperty({ example: 'CLIMATIZACION' })
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  category: string;

  @ApiProperty({ example: 800.0 })
  @IsNumber()
  @Min(0, { message: 'El precio base no puede ser negativo' })
  basePrice: number;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
