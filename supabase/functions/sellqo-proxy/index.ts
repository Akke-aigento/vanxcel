import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SELLQO_API_URL = "https://gczmfcabnoofnmfpzeop.supabase.co/functions/v1/storefront-api";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-tenant-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const SELLQO_API_KEY = Deno.env.get('SELLQO_API_KEY');

  if (!SELLQO_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'SELLQO_API_KEY not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/sellqo-proxy/, '') || '/';
    const tenantId = req.headers.get('X-Tenant-ID') || 'vanxcel';

    const targetUrl = new URL(`${SELLQO_API_URL}${path}`);
    url.searchParams.forEach((value, key) => targetUrl.searchParams.set(key, value));

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Key': SELLQO_API_KEY,
      'X-Tenant-ID': tenantId,
    };

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const body = await req.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    const response = await fetch(targetUrl.toString(), fetchOptions);
    const responseBody = await response.text();

    return new Response(responseBody, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('SellQo proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Proxy request failed', details: error.message }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
