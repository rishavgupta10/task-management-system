import {
  Task,
  PaginatedResponse,
  CreateTaskPayload,
  UpdateTaskPayload,
  QueryTasksParams,
  ApiErrorResponse,
} from '../types/task';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiError extends Error {
  statusCode: number;
  error: string;

  constructor(statusCode: number, error: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.error = error;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();

    if (!response.ok) {
      const errRes = data as ApiErrorResponse;
      throw new ApiError(
        response.status,
        errRes.error || 'ERROR',
        errRes.message || 'An unexpected error occurred',
      );
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Network or parse error
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      err.message || 'Unable to connect to server. Please check your connection.',
    );
  }
}

export const api = {
  getTasks: async (params: QueryTasksParams = {}): Promise<PaginatedResponse<Task>> => {
    const searchParams = new URLSearchParams();

    if (params.search) searchParams.append('search', params.search);
    if (params.status) searchParams.append('status', params.status);
    if (params.priority) searchParams.append('priority', params.priority);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    return request<PaginatedResponse<Task>>(`/tasks${queryString ? `?${queryString}` : ''}`);
  },

  getTask: async (id: string): Promise<Task> => {
    return request<Task>(`/tasks/${id}`);
  },

  createTask: async (payload: CreateTaskPayload, idempotencyKey?: string): Promise<Task> => {
    // Generate UUID if not provided so retries automatically reuse the same key
    const key =
      idempotencyKey ||
      (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'idemp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9));

    return request<Task>('/tasks', {
      method: 'POST',
      headers: {
        'Idempotency-Key': key,
      },
      body: JSON.stringify(payload),
    });
  },

  updateTask: async (id: string, payload: UpdateTaskPayload): Promise<Task> => {
    return request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteTask: async (id: string): Promise<void> => {
    return request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  checkHealth: async (): Promise<{ status: string; timestamp: string }> => {
    return request<{ status: string; timestamp: string }>('/health');
  },
};

export { ApiError };
