import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateProviderProfileDto {
  @ApiPropertyOptional({ example: 'Plomero con 10 años de experiencia' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  bio?: string;

  @ApiPropertyOptional({ example: ['PLOMERIA', 'ELECTRICIDAD'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceType?: string[];

  @ApiPropertyOptional({ example: 19.4326 })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @ApiPropertyOptional({ example: -99.1332 })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
