const SELLQO_PROXY_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/sellqo-proxy`;
const TENANT_ID = 'vanxcel';

let currentLocale = 'nl';

export function setSellqoLocale(locale: string) {
  currentLocale = locale;
}

export function detectLocale(): string {
  const hostname = window.location.hostname;
  if (hostname.endsWith('.nl')) return 'nl-NL';
  if (hostname.endsWith('.be')) return 'nl-BE';
  return 'nl';
}

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
      'Accept-Language': currentLocale,
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

/**
 * Extract array from API response: { data: { products: [...] } } or { data: [...] }
 */
export function extractArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object') {
    const r = response as Record<string, unknown>;
    if (r.data && typeof r.data === 'object' && !Array.isArray(r.data)) {
      const inner = r.data as Record<string, unknown>;
      if (Array.isArray(inner.products)) return inner.products as T[];
      if (Array.isArray(inner.items)) return inner.items as T[];
      if (Array.isArray(inner.data)) return inner.data as T[];
    }
    if (Array.isArray(r.data)) return r.data as T[];
    if (Array.isArray(r.products)) return r.products as T[];
    if (Array.isArray(r.items)) return r.items as T[];
  }
  return [];
}

/**
 * Extract single object from API response: { data: {...} }
 */
export function extractSingle<T>(response: unknown): T | null {
  if (!response || typeof response !== 'object') return null;
  const r = response as Record<string, unknown>;
  if (r.data && typeof r.data === 'object' && !Array.isArray(r.data)) {
    return r.data as T;
  }
  if (r.id) return r as unknown as T;
  return null;
}
