import {
  AuthResponse,
  RegisterPayload,
  RegisterResult,
  PaginatedResponse,
  ServiceRequest,
  Service,
  Provider,
  Payment,
  Rating,
  User,
  RequestStats,
  UserStats,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// In-memory token state — never touches localStorage
let _authToken: string | null = null;

export function setAuthToken(token: string | null) {
  _authToken = token;
}

function getToken(): string | null {
  return _authToken;
}

// ── Typed API error ──────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: string[],
    public readonly suggestion?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNetworkError() { return this.statusCode === 0; }
  get isUnauthorized() { return this.statusCode === 401; }
  get isForbidden()    { return this.statusCode === 403; }
  get isNotFound()     { return this.statusCode === 404; }
  get isConflict()     { return this.statusCode === 409; }
  get isRateLimit()    { return this.statusCode === 429; }
  get isServerError()  { return this.statusCode >= 500; }
}

const HTTP_MESSAGES: Record<number, string> = {
  400: 'Datos incorrectos. Revisa los campos del formulario.',
  401: 'Tu sesión expiró. Inicia sesión nuevamente.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'El recurso solicitado no fue encontrado.',
  409: 'Ya existe un registro con esos datos.',
  422: 'Los datos enviados no son válidos.',
  429: 'Demasiados intentos. Espera un minuto e intenta de nuevo.',
  500: 'Estamos teniendo problemas internos. Intenta más tarde.',
  503: 'Servicio no disponible temporalmente.',
};

// ── Core fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Sin conexión a internet. Verifica tu red e intenta de nuevo.',
    );
  }

  if (!res.ok) {
    let body: Record<string, unknown> = {};
    try { body = await res.json() as Record<string, unknown>; } catch { /* non-JSON error body */ }

    const message =
      (body?.message as string | undefined) ??
      HTTP_MESSAGES[res.status] ??
      `Error ${res.status}`;

    throw new ApiError(
      res.status,
      (body?.code as string | undefined) ?? 'UNKNOWN_ERROR',
      message,
      body?.details as string[] | undefined,
      body?.suggestion as string | undefined,
    );
  }

  return res.json() as Promise<T>;
}

// BFF routes are same-origin (Next.js API routes) — no auth header needed
async function bffRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
      credentials: 'same-origin',
    });
  } catch {
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Sin conexión a internet. Verifica tu red e intenta de nuevo.',
    );
  }

  if (!res.ok) {
    let body: Record<string, unknown> = {};
    try { body = await res.json() as Record<string, unknown>; } catch { /* non-JSON error body */ }

    const message =
      (body?.message as string | undefined) ??
      HTTP_MESSAGES[res.status] ??
      `Error ${res.status}`;

    throw new ApiError(
      res.status,
      (body?.code as string | undefined) ?? 'UNKNOWN_ERROR',
      message,
      body?.details as string[] | undefined,
      body?.suggestion as string | undefined,
    );
  }

  return res.json() as Promise<T>;
}

// ── API modules ──────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    bffRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data: RegisterPayload) =>
    bffRequest<RegisterResult>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  me: () => bffRequest<AuthResponse>('/api/auth/me'),
  logout: () =>
    bffRequest<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),
};

export const servicesApi = {
  getAll: (category?: string) =>
    request<Service[]>(`/services${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  getById: (id: string) => request<Service>(`/services/${id}`),
  getCategories: () => request<string[]>('/services/categories'),
};

export const requestsApi = {
  create: (data: Omit<ServiceRequest, 'id' | 'clientId' | 'status' | 'createdAt' | 'updatedAt' | 'client' | 'service' | 'provider' | 'payment' | 'rating'>) =>
    request<ServiceRequest>('/service-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAll: (status?: string) =>
    request<ServiceRequest[]>(`/service-requests${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  getAllPaginated: (page: number, limit: number, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);
    return request<PaginatedResponse<ServiceRequest>>(`/service-requests?${params.toString()}`);
  },
  getById: (id: string) => request<ServiceRequest>(`/service-requests/${id}`),
  accept: (id: string) =>
    request<ServiceRequest>(`/service-requests/${id}/accept`, { method: 'PATCH' }),
  updateStatus: (id: string, status: string) =>
    request<ServiceRequest>(`/service-requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getHistory: () => request<ServiceRequest[]>('/service-requests/history'),
  getStats: () => request<RequestStats>('/service-requests/stats'),
};

export const providersApi = {
  getAll: () => request<Provider[]>('/providers'),
  getById: (id: string) => request<Provider>(`/providers/${id}`),
  getMyProfile: () => request<Provider>('/providers/profile'),
  updateProfile: (data: Partial<Pick<Provider, 'bio' | 'isAvailable' | 'lat' | 'lng'>>) =>
    request<Provider>('/providers/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

export const paymentsApi = {
  create: (serviceRequestId: string) =>
    request<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify({ serviceRequestId }),
    }),
  simulate: (requestId: string) =>
    request<Payment>(`/payments/${requestId}/simulate`, { method: 'POST' }),
  getByRequest: (requestId: string) => request<Payment>(`/payments/${requestId}`),
};

export const ratingsApi = {
  create: (data: { serviceRequestId: string; score: number; comment?: string }) =>
    request<Rating>('/ratings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const usersApi = {
  getAll: () => request<User[]>('/users'),
  getStats: () => request<UserStats>('/users/stats'),
  updateMe: (data: { name?: string; phone?: string }) =>
    request<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

export const adminApi = {
  suspendUser: (id: string) =>
    request<User>(`/admin/users/${id}/suspend`, { method: 'PATCH' }),
  reactivateUser: (id: string) =>
    request<User>(`/admin/users/${id}/reactivate`, { method: 'PATCH' }),
  cancelRequest: (id: string) =>
    request<ServiceRequest>(`/admin/requests/${id}/cancel`, { method: 'PATCH' }),
};
