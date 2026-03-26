const PROXY_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/sellqo-customer-proxy`;
const CUSTOMER_TENANT_ID = '54f6b480-280b-42e1-b843-d5beb2831acd';

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
    body: JSON.stringify({ action, tenant_id: CUSTOMER_TENANT_ID, params }),
  });

  const text = await res.text();
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server error (${res.status}): ${text.slice(0, 200)}`);
  }
  if (!data.success) {
    const msg = typeof data.error === 'string' ? data.error
      : typeof data.message === 'string' ? data.message
      : `API error (${res.status})`;
    throw new Error(msg);
  }
  return data.data;
}
