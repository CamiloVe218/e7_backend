export type Role = 'CLIENTE' | 'PROVEEDOR' | 'ADMIN';

export type RequestStatus =
  | 'PENDIENTE'
  | 'ACEPTADA'
  | 'EN_PROCESO'
  | 'FINALIZADA'
  | 'CANCELADA';

export type PaymentStatus = 'PENDIENTE' | 'COMPLETADO' | 'FALLIDO' | 'REEMBOLSADO';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  createdAt: string;
  provider?: Provider;
}

export interface Provider {
  id: string;
  userId: string;
  bio?: string;
  rating: number;
  isAvailable: boolean;
  lat?: number;
  lng?: number;
  serviceType: string[];
  createdAt: string;
  user?: Partial<User>;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ServiceRequest {
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
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  client: Partial<User>;
  service: Service;
  provider?: Provider & { user: Partial<User> };
  payment?: Payment;
  rating?: Rating;
}

export interface Payment {
  id: string;
  serviceRequestId: string;
  amount: number;
  status: PaymentStatus;
  method: string;
  transactionId?: string;
  createdAt: string;
}

export interface Rating {
  id: string;
  serviceRequestId: string;
  clientId: string;
  providerId: string;
  score: number;
  comment?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateRequestPayload {
  serviceId: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  scheduledAt?: string;
  price?: number;
}
