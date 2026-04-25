import { IsEnum } from 'class-validator';

export enum RequestStatus {
  PENDIENTE = 'PENDIENTE',
  ACEPTADA = 'ACEPTADA',
  EN_PROCESO = 'EN_PROCESO',
  FINALIZADA = 'FINALIZADA',
  CANCELADA = 'CANCELADA',
}

export class UpdateStatusDto {
  @IsEnum(RequestStatus, { message: 'Estado inválido' })
  status: RequestStatus;
}
