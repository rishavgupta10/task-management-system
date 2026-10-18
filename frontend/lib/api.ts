import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import {
  Task,
  PaginatedResponse,
  CreateTaskPayload,
  UpdateTaskPayload,
  QueryTasksParams,
  ApiErrorResponse,
} from '../types/task';

// Dynamic API Base URL resolution:
// 1. Checks NEXT_PUBLIC_API_URL environment variable
// 2. If running in browser on Render (*.onrender.com), routes to the live Render backend
// 3. Otherwise defaults to localhost:4000 for local development
const getApiBaseUrl = (): string => {
  // If explicitly provided via environment
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost') && envUrl.startsWith('http')) {
    return envUrl.replace(/\/$/, '');
  }
  // When running inside a browser on deployed environments
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('onrender.com') || host.includes('vercel.app')) {
      return 'https://task-management-backend-4t4j.onrender.com';
    }
  }
  // If envUrl is just a hostname without http/https (e.g. from Render fromService)
  if (envUrl && !envUrl.startsWith('http')) {
    return `https://${envUrl.replace(/\/$/, '')}`;
  }
  return envUrl || 'http://localhost:4000';
};

const API_BASE_URL = getApiBaseUrl();

// 1. Create configured Axios client instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Update baseURL dynamically in browser on every request
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const resolvedUrl = getApiBaseUrl();
  config.baseURL = resolvedUrl;
  return config;
});

// 2. Request Interceptor: Attach Idempotency keys, tenant headers, and auth tokens automatically
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Automatically generate Idempotency-Key for POST creation requests if not present
    if (config.method?.toLowerCase() === 'post' && !config.headers['Idempotency-Key']) {
      const idempotencyKey =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : 'idemp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);

      config.headers['Idempotency-Key'] = idempotencyKey;
    }

    // Default multi-tenant context (can be dynamic based on current user / organization)
    if (!config.headers['x-organization-id']) {
      config.headers['x-organization-id'] = 'org_default';
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 3. Custom Application ApiError class
export class ApiError extends Error {
  statusCode: number;
  error: string;

  constructor(statusCode: number, error: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.error = error;
  }
}

// 4. Response Interceptor: Standardize API responses and error messages
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      // Server returned HTTP status out of 2xx range
      const { status, data } = error.response;
      const errorType = data?.error || 'HTTP_ERROR';
      const errorMessage = data?.message || error.message || 'An unexpected server error occurred.';

      return Promise.reject(new ApiError(status, errorType, errorMessage));
    } else if (error.request) {
      // Network timeout or server unreachable
      return Promise.reject(
        new ApiError(
          0,
          'NETWORK_ERROR',
          'Unable to reach server. Please check your internet connection or server status.'
        )
      );
    } else {
      return Promise.reject(new ApiError(0, 'REQUEST_SETUP_ERROR', error.message));
    }
  }
);

// 5. Clean, Strongly-Typed API Service Methods Interface
export const api = {
  /**
   * Fetch paginated tasks with search, status, and priority filters
   */
  getTasks: async (params: QueryTasksParams = {}): Promise<PaginatedResponse<Task>> => {
    // Clean params so empty strings ('') are not sent as query values like status="" or priority=""
    const cleanParams: Record<string, any> = {};

    if (params.search && params.search.trim()) cleanParams.search = params.search.trim();
    if (params.status) cleanParams.status = params.status;
    if (params.priority) cleanParams.priority = params.priority;
    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;

    const response = await apiClient.get<PaginatedResponse<Task>>('/tasks', {
      params: cleanParams,
    });
    return response.data;
  },

  /**
   * Fetch single task details by ID
   */
  getTask: async (id: string): Promise<Task> => {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  /**
   * Create a new task (automatically passes Idempotency-Key via interceptor)
   */
  createTask: async (payload: CreateTaskPayload, customIdempotencyKey?: string): Promise<Task> => {
    const headers = customIdempotencyKey ? { 'Idempotency-Key': customIdempotencyKey } : {};
    const response = await apiClient.post<Task>('/tasks', payload, { headers });
    return response.data;
  },

  /**
   * Update task by ID (supports expectedUpdatedAt for Optimistic Concurrency Control)
   */
  updateTask: async (id: string, payload: UpdateTaskPayload): Promise<Task> => {
    const response = await apiClient.patch<Task>(`/tasks/${id}`, payload);
    return response.data;
  },

  /**
   * Delete task by ID
   */
  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },

  /**
   * Health check probe
   */
  checkHealth: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await apiClient.get<{ status: string; timestamp: string }>('/health');
    return response.data;
  },
};

// Export raw configured Axios client for custom calls
export { apiClient };
export default api;
