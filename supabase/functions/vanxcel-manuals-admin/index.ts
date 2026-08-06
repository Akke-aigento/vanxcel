import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const UPSTREAM_URL = "https://gczmfcabnoofnmfpzeop.supabase.co/functions/v1/storefront-customer-api";
const TENANT_ID = "54f6b480-280b-42e1-b843-d5beb2831acd";
const BUCKET = "product-manuals";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-storefront-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

async function getCustomer(token: string | null): Promise<{ email?: string } | null> {
  if (!token) return null;
  const apiKey = Deno.env.get("SELLQO_API_KEY");
  if (!apiKey) return null;
  try {
    const res = await fetch(UPSTREAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
        "x-storefront-token": token,
      },
      body: JSON.stringify({ action: "get_profile", tenant_id: TENANT_ID, params: {} }),
    });
    const data = await res.json();
    if (!data?.success) return null;
    return (data.data ?? null) as { email?: string } | null;
  } catch (_e) {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ success: false, error: "Invalid JSON" }, 400);
  }

  const action = String(body.action ?? "");
  const db = admin();

  // --- Public action: signed download URL, only for published manuals ---
  if (action === "get_download_url") {
    const storagePath = String(body.storage_path ?? "");
    if (!storagePath) return json({ success: false, error: "storage_path required" }, 400);

    const { data: row } = await db
      .from("product_manuals")
      .select("id,is_published")
      .eq("storage_path", storagePath)
      .maybeSingle();

    const isAdminReq = await (async () => {
      const c = await getCustomer(req.headers.get("x-storefront-token"));
      const adminEmail = Deno.env.get("ADMIN_EMAIL");
      return !!c?.email && !!adminEmail && c.email.toLowerCase() === adminEmail.toLowerCase();
    })();

    if (!row || (!row.is_published && !isAdminReq)) {
      return json({ success: false, error: "Not found" }, 404);
    }

    const { data, error } = await db.storage.from(BUCKET).createSignedUrl(storagePath, 300);
    if (error || !data) return json({ success: false, error: error?.message ?? "Sign failed" }, 500);
    return json({ success: true, data: { url: data.signedUrl } });
  }

  // --- Everything below requires owner ---
  const customer = await getCustomer(req.headers.get("x-storefront-token"));
  const adminEmail = Deno.env.get("ADMIN_EMAIL");
  if (!customer?.email || !adminEmail || customer.email.toLowerCase() !== adminEmail.toLowerCase()) {
    return json({ success: false, error: "Forbidden" }, 403);
  }

  try {
    switch (action) {
      case "list": {
        const { data, error } = await db
          .from("product_manuals")
          .select("*")
          .order("product_name", { ascending: true })
          .order("sort_order", { ascending: true });
        if (error) throw error;
        return json({ success: true, data });
      }

      case "get_upload_url": {
        const path = `${crypto.randomUUID()}.pdf`;
        const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(path);
        if (error || !data) throw error ?? new Error("Upload URL failed");
        return json({
          success: true,
          data: { url: data.signedUrl, token: data.token, storage_path: path },
        });
      }

      case "create": {
        const payload = {
          product_sku: String(body.product_sku ?? ""),
          product_name: String(body.product_name ?? ""),
          language: String(body.language ?? ""),
          title: String(body.title ?? ""),
          storage_path: String(body.storage_path ?? ""),
          file_size: body.file_size ? Number(body.file_size) : null,
          sort_order: body.sort_order ? Number(body.sort_order) : 0,
          is_published: Boolean(body.is_published ?? false),
        };
        if (!payload.product_sku || !payload.product_name || !payload.title || !payload.storage_path) {
          return json({ success: false, error: "Missing required fields" }, 400);
        }
        if (!["nl", "en", "fr", "de"].includes(payload.language)) {
          return json({ success: false, error: "Invalid language" }, 400);
        }
        const { data, error } = await db.from("product_manuals").insert(payload).select().single();
        if (error) throw error;
        return json({ success: true, data });
      }

      case "update": {
        const id = String(body.id ?? "");
        if (!id) return json({ success: false, error: "id required" }, 400);
        const patch: Record<string, unknown> = {};
        for (const key of ["title", "language", "product_sku", "product_name"]) {
          if (body[key] !== undefined) patch[key] = String(body[key]);
        }
        if (body.is_published !== undefined) patch.is_published = Boolean(body.is_published);
        if (body.sort_order !== undefined) patch.sort_order = Number(body.sort_order);
        if (patch.language && !["nl", "en", "fr", "de"].includes(patch.language as string)) {
          return json({ success: false, error: "Invalid language" }, 400);
        }
        const { data, error } = await db
          .from("product_manuals")
          .update(patch)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return json({ success: true, data });
      }

      case "delete": {
        const id = String(body.id ?? "");
        if (!id) return json({ success: false, error: "id required" }, 400);
        const { data: row, error: selErr } = await db
          .from("product_manuals")
          .select("storage_path")
          .eq("id", id)
          .maybeSingle();
        if (selErr) throw selErr;
        if (row?.storage_path) {
          await db.storage.from(BUCKET).remove([row.storage_path]);
        }
        const { error } = await db.from("product_manuals").delete().eq("id", id);
        if (error) throw error;
        return json({ success: true, data: { id } });
      }

      default:
        return json({ success: false, error: `Unknown action: ${action}` }, 400);
    }
  } catch (error) {
    console.error("vanxcel-manuals-admin error:", error);
    return json({ success: false, error: (error as Error).message ?? "Server error" }, 500);
  }
});
