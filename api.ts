import { User, Item, Troca, DbInfo } from '../types';

let authToken: string | null = localStorage.getItem('troca_token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('troca_token', token);
  } else {
    localStorage.removeItem('troca_token');
  }
}

export function getAuthToken(): string | null {
  return authToken || localStorage.getItem('troca_token');
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Erro na requisição.');
  }

  return data as T;
}

export const api = {
  // Auth & Users (Integrante 1)
  auth: {
    register: (payload: { nome: string; email: string; senha: string; confirmacao_senha: string }) =>
      request<{ message: string; user: User; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    login: (payload: { email: string; senha: string }) =>
      request<{ message: string; user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    logout: () =>
      request<{ message: string }>('/api/auth/logout', {
        method: 'POST',
      }),

    getMe: () =>
      request<{ user: User }>('/api/auth/me'),

    getProfile: () =>
      request<{ profile: User }>('/api/users/profile'),

    updateProfile: (payload: {
      nome?: string;
      email?: string;
      senha_atual?: string;
      nova_senha?: string;
      confirmacao_nova_senha?: string;
    }) =>
      request<{ message: string; user: User }>('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),

    getAllUsers: () =>
      request<{ users: User[] }>('/api/users'),

    getUserItems: (userId: number) =>
      request<{ items: Item[] }>(`/api/users/${userId}/items`),
  },

  // Itens (Integrante 2)
  items: {
    list: (params?: { categoria?: string; estado?: string; status?: string; busca?: string; exclude_me?: boolean }) => {
      const searchParams = new URLSearchParams();
      if (params?.categoria) searchParams.append('categoria', params.categoria);
      if (params?.estado) searchParams.append('estado', params.estado);
      if (params?.status) searchParams.append('status', params.status);
      if (params?.busca) searchParams.append('busca', params.busca);
      if (params?.exclude_me) searchParams.append('exclude_me', 'true');
      const qs = searchParams.toString();
      return request<{ items: Item[] }>(`/api/items${qs ? `?${qs}` : ''}`);
    },

    getById: (id: number) =>
      request<{ item: Item }>(`/api/items/${id}`),

    create: (payload: {
      nome: string;
      descricao?: string;
      categoria: string;
      estado_conservacao: string;
      imagem_url?: string;
    }) =>
      request<{ message: string; item: Item }>('/api/items', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    update: (
      id: number,
      payload: {
        nome?: string;
        descricao?: string;
        categoria?: string;
        estado_conservacao?: string;
        status?: string;
        imagem_url?: string;
      }
    ) =>
      request<{ message: string; item: Item }>(`/api/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),

    delete: (id: number) =>
      request<{ message: string }>(`/api/items/${id}`, {
        method: 'DELETE',
      }),
  },

  // Trocas (Integrante 3)
  trocas: {
    criarProposta: (payload: { item_oferecido_id: number; item_solicitado_id: number }) =>
      request<{ message: string; troca: Troca }>('/api/trocas', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    listarRecebidas: () =>
      request<{ propostas: Troca[] }>('/api/trocas/recebidas'),

    listarEnviadas: () =>
      request<{ propostas: Troca[] }>('/api/trocas/enviadas'),

    historico: () =>
      request<{ historico: Troca[] }>('/api/trocas/historico'),

    aceitar: (id: number) =>
      request<{ message: string; troca: Troca }>(`/api/trocas/${id}/aceitar`, {
        method: 'POST',
      }),

    recusar: (id: number) =>
      request<{ message: string; troca: Troca }>(`/api/trocas/${id}/recusar`, {
        method: 'POST',
      }),

    cancelar: (id: number) =>
      request<{ message: string; troca: Troca }>(`/api/trocas/${id}/cancelar`, {
        method: 'POST',
      }),
  },

  // Diagnóstico e Banco de Dados (Integrante 1)
  db: {
    getInfo: () => request<DbInfo>('/api/db/info'),
    reset: () => request<{ message: string }>('/api/db/reset', { method: 'POST' }),
  },
};
