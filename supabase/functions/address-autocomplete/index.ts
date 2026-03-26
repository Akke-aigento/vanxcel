import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const TOMTOM_API_KEY = Deno.env.get("TOMTOM_API_KEY");
  if (!TOMTOM_API_KEY) {
    return new Response(JSON.stringify({ error: "TOMTOM_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string" || query.length < 3) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL("https://api.tomtom.com/search/2/search/" + encodeURIComponent(query) + ".json");
    url.searchParams.set("key", TOMTOM_API_KEY);
    url.searchParams.set("typeahead", "true");
    url.searchParams.set("limit", "5");
    url.searchParams.set("countrySet", "BE,NL,DE,FR,LU,AT,CH,GB,ES,IT,PT,DK,SE,NO,PL,CZ,IE");
    url.searchParams.set("language", "nl-NL");
    url.searchParams.set("idxSet", "Addr,PAD,Str");

    const ttRes = await fetch(url.toString());
    const ttData = await ttRes.json();

    const results = (ttData.results || []).map((r: any, i: number) => {
      const addr = r.address || {};
      const streetName = addr.streetName || "";
      const streetNumber = addr.streetNumber || "";
      const postalCode = addr.postalCode || "";
      const municipality = addr.municipality || addr.localName || "";
      const countryCode = addr.countryCode || "";

      return {
        id: `${i}-${postalCode}-${streetName}`,
        label: addr.freeformAddress || `${streetName} ${streetNumber}, ${postalCode} ${municipality}`,
        street: streetName,
        house_number: streetNumber,
        postal_code: postalCode,
        city: municipality,
        country: countryCode,
      };
    });

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
