import type { OptimizeRequest, OptimizeResponse, HealthResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL as string;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const apiService = {
  health: (): Promise<HealthResponse> => request<HealthResponse>('/health'),

  optimize: (payload: OptimizeRequest): Promise<OptimizeResponse> =>
    request<OptimizeResponse>('/optimize', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
