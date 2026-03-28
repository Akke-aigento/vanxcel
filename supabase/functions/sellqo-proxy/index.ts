import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SELLQO_API_URL = "https://gczmfcabnoofnmfpzeop.supabase.co/functions/v1/storefront-api";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-tenant-id, accept-language, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

/**
 * Translate a REST-style path + method + query/body into a SellQo storefront-api
 * POST body: { action, tenant_id, params }
 */
function resolveAction(
  method: string,
  path: string,
  query: URLSearchParams,
  body: Record<string, unknown> | null,
  tenantId: string,
  locale: string | null,
): { action: string; tenant_id: string; params: Record<string, unknown> } {
  // Strip leading slash
  const segments = path.replace(/^\//, '').split('/').filter(Boolean);
  const params: Record<string, unknown> = {};
  if (locale) params.locale = locale;

  // --- PRODUCTS ---
  if (segments[0] === 'products') {
    if (segments.length === 1) {
      // GET /products?collection=X&per_page=Y&search=Q...
      for (const [k, v] of query.entries()) params[k] = v;
      // Map VanXcel param names to SellQo storefront-api param names
      if (params.sort) { params.sort_by = params.sort; delete params.sort; }
      if (params.collection) { params.category_slug = params.collection; delete params.collection; }
      if (params.category) { params.category_slug = params.category; delete params.category; }
      if (query.get('search')) return { action: 'search_products', tenant_id: tenantId, params };
      return { action: 'get_products', tenant_id: tenantId, params };
    }
    if (segments.length === 2) {
      // GET /products/:slug
      params.slug = segments[1];
      return { action: 'get_product', tenant_id: tenantId, params };
    }
    if (segments.length === 3 && segments[2] === 'related') {
      // GET /products/:slug/related?limit=4
      params.slug = segments[1];
      if (query.get('limit')) params.limit = Number(query.get('limit'));
      return { action: 'get_product', tenant_id: tenantId, params };
    }
  }

  // --- COLLECTIONS / CATEGORIES ---
  if (segments[0] === 'collections' || segments[0] === 'categories') {
    return { action: 'get_categories', tenant_id: tenantId, params };
  }

  // --- CART ---
  if (segments[0] === 'cart') {
    if (segments.length === 1 && method === 'POST') {
      return { action: 'cart_create', tenant_id: tenantId, params: { ...params, ...body } };
    }
    const cartId = segments[1];
    if (cartId) params.cart_id = cartId;

    if (segments.length === 2 && method === 'GET') {
      return { action: 'cart_get', tenant_id: tenantId, params };
    }

    // /cart/:id/items
    if (segments[2] === 'items') {
      if (segments.length === 3 && method === 'POST') {
        return { action: 'cart_add_item', tenant_id: tenantId, params: { ...params, ...body } };
      }
      if (segments.length === 4) {
        params.item_id = segments[3];
        if (method === 'PUT' || method === 'PATCH') {
          return { action: 'cart_update_item', tenant_id: tenantId, params: { ...params, ...body } };
        }
        if (method === 'DELETE') {
          return { action: 'cart_remove_item', tenant_id: tenantId, params };
        }
      }
    }

    // /cart/:id/discount
    if (segments[2] === 'discount') {
      if (method === 'POST') {
        return { action: 'cart_apply_discount', tenant_id: tenantId, params: { ...params, ...body } };
      }
      if (method === 'DELETE') {
        return { action: 'cart_remove_discount', tenant_id: tenantId, params };
      }
    }
  }

  // --- CHECKOUT ---
  if (segments[0] === 'checkout') {
    if (segments.length === 1 && method === 'POST') {
      return { action: 'checkout_start', tenant_id: tenantId, params: { ...params, ...body } };
    }
  }

  // --- SETTINGS ---
  if (segments[0] === 'settings') {
    return { action: 'get_config', tenant_id: tenantId, params };
  }

  // --- LEGAL / PAGES ---
  if (segments[0] === 'legal' || segments[0] === 'pages') {
    if (segments.length === 2) params.slug = segments[1];
    return { action: 'get_pages', tenant_id: tenantId, params };
  }

  // --- REVIEWS ---
  if (segments[0] === 'reviews') {
    for (const [k, v] of query.entries()) params[k] = v;
    return { action: 'get_reviews', tenant_id: tenantId, params };
  }

  // --- NEWSLETTER ---
  if (segments[0] === 'newsletter' && method === 'POST') {
    return { action: 'newsletter_subscribe', tenant_id: tenantId, params: { ...params, ...body } };
  }

  // --- SHIPPING ---
  if (segments[0] === 'shipping') {
    return { action: 'get_shipping_methods', tenant_id: tenantId, params };
  }

  // Fallback: try using the path as action name
  return { action: segments.join('_'), tenant_id: tenantId, params: { ...params, ...body } };
}

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
    const tenantSlug = req.headers.get('X-Tenant-ID') || 'vanxcel';
    // Map slug to UUID for the storefront-api
    const tenantId = tenantSlug === 'vanxcel' ? '54f6b480-280b-42e1-b843-d5beb2831acd' : tenantSlug;
    const locale = req.headers.get('Accept-Language') || null;

    // Parse body for non-GET methods
    let body: Record<string, unknown> | null = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const raw = await req.text();
      if (raw) {
        try { body = JSON.parse(raw); } catch { body = null; }
      }
    }

    // Build the storefront-api POST body
    const storefrontBody = resolveAction(req.method, path, url.searchParams, body, tenantId, locale);

    console.log(`[sellqo-proxy] ${req.method} ${path} → action: ${storefrontBody.action}`);

    const response = await fetch(SELLQO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': SELLQO_API_KEY,
      },
      body: JSON.stringify(storefrontBody),
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
    console.error('SellQo proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Proxy request failed', details: error.message }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
