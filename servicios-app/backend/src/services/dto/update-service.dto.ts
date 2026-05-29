import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateServiceDto {
  @ApiPropertyOptional({ example: 'Instalación de Aire Acondicionado' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name?: string;

  @ApiPropertyOptional({ example: 'Instalación profesional de unidades de aire acondicionado' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  description?: string;

  @ApiPropertyOptional({ example: 'CLIMATIZACION' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  category?: string;

  @ApiPropertyOptional({ example: 800.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
