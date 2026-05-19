import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RequestStatus {
  PENDIENTE = 'PENDIENTE',
  ACEPTADA = 'ACEPTADA',
  EN_PROCESO = 'EN_PROCESO',
  FINALIZADA = 'FINALIZADA',
  CANCELADA = 'CANCELADA',
}

export class UpdateStatusDto {
  @ApiProperty({ enum: RequestStatus, description: 'Nuevo estado de la solicitud' })
  @IsEnum(RequestStatus, { message: 'Estado inválido' })
  status: RequestStatus;
}
