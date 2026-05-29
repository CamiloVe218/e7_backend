import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRatingDto {
  @ApiProperty({ example: 'uuid-de-la-solicitud', description: 'ID de la solicitud de servicio finalizada' })
  @IsString()
  serviceRequestId: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5, description: 'Puntuación del 1 al 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  score: number;

  @ApiPropertyOptional({ example: 'Excelente trabajo, muy puntual y profesional.' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  comment?: string;
}
