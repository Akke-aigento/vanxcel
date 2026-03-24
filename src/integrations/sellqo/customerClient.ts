const PROXY_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/sellqo-customer-proxy`;

export async function customerApiFetch(
  action: string,
  params: Record<string, unknown> = {},
  token?: string | null
) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['x-storefront-token'] = token;

  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, tenant_id: 'vanxcel', params }),
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'API error');
  return data.data;
}
