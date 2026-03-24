import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const UPSTREAM_URL = "https://gczmfcabnoofnmfpzeop.supabase.co/functions/v1/storefront-customer-api";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-storefront-token, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const SELLQO_API_KEY = Deno.env.get('SELLQO_API_KEY');
  if (!SELLQO_API_KEY) {
    return new Response(
      JSON.stringify({ success: false, error: 'SELLQO_API_KEY not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.text();
    const storefrontToken = req.headers.get('x-storefront-token');

    const upstreamHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Key': SELLQO_API_KEY,
    };

    if (storefrontToken) {
      upstreamHeaders['x-storefront-token'] = storefrontToken;
    }

    const response = await fetch(UPSTREAM_URL, {
      method: 'POST',
      headers: upstreamHeaders,
      body,
    });

    const responseBody = await response.text();

    return new Response(responseBody, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('SellQo customer proxy error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Proxy request failed', details: error.message }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
