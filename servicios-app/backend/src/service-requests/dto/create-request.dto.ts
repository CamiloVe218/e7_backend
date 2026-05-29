import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRequestDto {
  @ApiProperty({ example: 'uuid-del-servicio' })
  @IsString()
  serviceId: string;

  @ApiProperty({ example: 'Necesito arreglar una gotera en el techo', minLength: 10 })
  @IsString()
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  description: string;

  @ApiProperty({ example: 'Av. Reforma 123, Col. Centro' })
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  address: string;

  @ApiProperty({ example: 19.4326 })
  @IsNumber()
  @Type(() => Number)
  lat: number;

  @ApiProperty({ example: -99.1332 })
  @IsNumber()
  @Type(() => Number)
  lng: number;

  @ApiPropertyOptional({ example: '2026-06-01T10:00:00.000Z' })
  @IsOptional()
  scheduledAt?: string;

  @ApiPropertyOptional({ example: 350 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ example: 'EFECTIVO', enum: ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'] })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
