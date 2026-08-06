const FN_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/vanxcel-manuals-admin`;

export interface ProductManual {
  id: string;
  product_sku: string;
  product_name: string;
  language: string;
  title: string;
  storage_path: string;
  file_size: number | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export async function manualsFetch<T = unknown>(
  body: Record<string, unknown>,
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["x-storefront-token"] = token;

  const res = await fetch(FN_URL, { method: "POST", headers, body: JSON.stringify(body) });
  const text = await res.text();
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server error (${res.status})`);
  }
  if (!data.success) {
    const msg = typeof data.error === "string" ? data.error : `Error (${res.status})`;
    const err = new Error(msg) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return data.data as T;
}

export async function getManualDownloadUrl(storagePath: string, token?: string | null) {
  const { url } = await manualsFetch<{ url: string }>(
    { action: "get_download_url", storage_path: storagePath },
    token,
  );
  return url;
}
