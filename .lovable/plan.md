

## Fix: Edge function 500 error op `/legal` endpoint

### Oorzaak

De SellQo upstream API retourneert `{"success":false,"error":"[object Object]"}` voor de `get_pages` action. Dit is een **upstream API probleem** — de proxy stuurt het antwoord correct door. De foutmelding `supabase/functions/legal/index.ts` is misleidend; die functie bestaat niet, het gaat om `sellqo-proxy`.

### Oplossing

De proxy moet deze fout graceful afhandelen zodat het geen 500 error meer triggert:

**Bestand: `supabase/functions/sellqo-proxy/index.ts`** — na het ontvangen van het SellQo response, check of het een error-response is en return dan een lege dataset i.p.v. de fout door te sturen:

```typescript
const responseBody = await response.text();

// If upstream returned an error for non-critical endpoints, return empty data
if (!response.ok) {
  const nonCriticalActions = ['get_pages'];
  if (nonCriticalActions.includes(storefrontBody.action)) {
    console.warn(`[sellqo-proxy] ${storefrontBody.action} failed: ${responseBody}`);
    return new Response(
      JSON.stringify({ data: [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
```

Dit voorkomt dat de runtime error tracker een 500 registreert voor niet-kritische endpoints zoals `/legal`.

### Technisch
- 1 bestand: `supabase/functions/sellqo-proxy/index.ts` (regels 180-188)
- De Frontend hoeft niet te wijzigen — `Footer.tsx` heeft al een `.catch(() => {})`

