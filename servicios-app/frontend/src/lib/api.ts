const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
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
    let body: Record<string, any> = {};
    try { body = await res.json(); } catch { /* non-JSON error body */ }

    const message =
      body?.message ??
      HTTP_MESSAGES[res.status] ??
      `Error ${res.status}`;

    throw new ApiError(
      res.status,
      body?.code ?? 'UNKNOWN_ERROR',
      message,
      body?.details,
      body?.suggestion,
    );
  }

  return res.json() as Promise<T>;
}

// ── API modules ──────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data: any) =>
    request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  me: () => request<any>('/users/me'),
};

export const servicesApi = {
  getAll: (category?: string) =>
    request<any[]>(`/services${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  getById: (id: string) => request<any>(`/services/${id}`),
  getCategories: () => request<string[]>('/services/categories'),
};

export const requestsApi = {
  create: (data: any) =>
    request<any>('/service-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAll: (status?: string) =>
    request<any[]>(`/service-requests${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  getById: (id: string) => request<any>(`/service-requests/${id}`),
  accept: (id: string) =>
    request<any>(`/service-requests/${id}/accept`, { method: 'PATCH' }),
  updateStatus: (id: string, status: string) =>
    request<any>(`/service-requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getHistory: () => request<any[]>('/service-requests/history'),
  getStats: () => request<any>('/service-requests/stats'),
};

export const providersApi = {
  getAll: () => request<any[]>('/providers'),
  getById: (id: string) => request<any>(`/providers/${id}`),
  getMyProfile: () => request<any>('/providers/profile'),
  updateProfile: (data: any) =>
    request<any>('/providers/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

export const paymentsApi = {
  create: (serviceRequestId: string) =>
    request<any>('/payments', {
      method: 'POST',
      body: JSON.stringify({ serviceRequestId }),
    }),
  simulate: (requestId: string) =>
    request<any>(`/payments/${requestId}/simulate`, { method: 'POST' }),
  getByRequest: (requestId: string) => request<any>(`/payments/${requestId}`),
};

export const ratingsApi = {
  create: (data: any) =>
    request<any>('/ratings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const usersApi = {
  getAll: () => request<any[]>('/users'),
  getStats: () => request<any>('/users/stats'),
  updateMe: (data: { name?: string; phone?: string }) =>
    request<any>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
