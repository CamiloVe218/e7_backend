export type Role = 'CLIENTE' | 'PROVEEDOR' | 'ADMIN';

export type RequestStatus =
  | 'PENDIENTE'
  | 'ACEPTADA'
  | 'EN_PROCESO'
  | 'FINALIZADA'
  | 'CANCELADA';

export type PaymentStatus = 'PENDIENTE' | 'COMPLETADO' | 'FALLIDO' | 'REEMBOLSADO';

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  createdAt: string;
}

export interface ProviderDto {
  id: string;
  userId: string;
  bio?: string;
  rating: number;
  isAvailable: boolean;
  lat?: number;
  lng?: number;
  serviceType: string[];
  createdAt: string;
}

export interface ServiceDto {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  isActive: boolean;
  createdAt: string;
}

export interface ServiceRequestDto {
  id: string;
  clientId: string;
  serviceId: string;
  providerId?: string;
  status: RequestStatus;
  description: string;
  address: string;
  lat: number;
  lng: number;
  scheduledAt?: string;
  price?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequestDto {
  serviceId: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  scheduledAt?: string;
  price?: number;
}

export interface AuthLoginDto {
  email: string;
  password: string;
}

export interface AuthRegisterDto {
  email: string;
  password: string;
  name: string;
  role?: Role;
  phone?: string;
  bio?: string;
  serviceType?: string[];
}

export interface AuthResponseDto {
  user: UserDto;
  token: string;
}
