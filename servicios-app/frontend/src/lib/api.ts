const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error de red' }));
    throw new Error(err.message || `Error ${res.status}`);
  }

  return res.json();
}

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
    request<any[]>(`/services${category ? `?category=${category}` : ''}`),
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
    request<any[]>(`/service-requests${status ? `?status=${status}` : ''}`),
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
