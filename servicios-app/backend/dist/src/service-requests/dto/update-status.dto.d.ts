export declare enum RequestStatus {
    PENDIENTE = "PENDIENTE",
    ACEPTADA = "ACEPTADA",
    EN_PROCESO = "EN_PROCESO",
    FINALIZADA = "FINALIZADA",
    CANCELADA = "CANCELADA"
}
export declare class UpdateStatusDto {
    status: RequestStatus;
}
