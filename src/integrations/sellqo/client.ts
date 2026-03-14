const SELLQO_PROXY_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/sellqo-proxy`;
const TENANT_ID = 'vanxcel';

export class SellQoError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'SellQoError';
    this.status = status;
  }
}

export async function sellqoFetch<T = unknown>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${SELLQO_PROXY_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': TENANT_ID,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new SellQoError(
      errorBody || `Request failed with status ${response.status}`,
      response.status
    );
  }

  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}
