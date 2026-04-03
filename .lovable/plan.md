
## Checkout: waarschijnlijk grensprobleem tussen frontend en SellQo

### Wat ik nu bevestigd heb
- De klik zelf werkt: de checkout-call bereikt de proxy (`POST /checkout → action: checkout_start`)
- De knop hangt niet meer vast in de UI; dat deel is al opgelost
- De store settings tonen `guest_checkout: true` en `stripe_enabled: true`
- De huidige frontend stuurt nog altijd return URLs op basis van `window.location.origin`
- In preview is dat een Lovable preview-domein, terwijl de store alleen VanXcel-domeinen kent (`vanxcel.be`, `vanxcel.nl`, `vanxcel.com`)

### Meest waarschijnlijke root cause
De checkout sessie faalt waarschijnlijk omdat SellQo een preview-URL als `success_url` / `cancel_url` krijgt. Daardoor komt er geen geldige `checkout_url` terug. Dus: ja, er kan iets aan SellQo-kant meespelen, maar de eerste concrete fout zit waarschijnlijk in de URLs die wij meesturen.

### Plan
1. **Return URLs niet langer op preview-origin baseren**
   - In `src/components/CartDrawer.tsx` een checkout base URL bepalen:
     - `.be` → `https://vanxcel.be`
     - `.nl` → `https://vanxcel.nl`
     - `.com` → `https://vanxcel.com`
     - preview/lovable-domeinen → fallback naar `https://vanxcel.be`

2. **Succes-URL corrigeren**
   - `success_url` opnieuw opbouwen als:
     `.../bedankt?cart_id=${cartId}`
   - `ThankYou.tsx` verwacht die `cart_id` al, dus dit moet sowieso terugkomen

3. **Checkout-fouten expliciet behandelen**
   - In `src/integrations/sellqo/hooks.ts` / `client.ts` ook `{ success: false, error: ... }` als echte fout behandelen
   - Dan zien we de upstream checkout-fout expliciet, niet alleen “No checkout URL returned”

4. **Gerichte logging in de proxy**
   - In `supabase/functions/sellqo-proxy/index.ts` voor `checkout_start` tijdelijk upstream status + body loggen
   - Daarmee kunnen we exact bevestigen of SellQo de return URL afkeurt of iets anders mist

### Als het dan nog steeds faalt
Dan is het inderdaad een SellQo-side issue. De concrete SellQo-check wordt dan:
- accepteert `checkout_start` de opgegeven return domains?
- geeft deze tenant effectief een `checkout_url` terug?
- waarom retourneert de upstream wel een response, maar geen bruikbare checkout sessie?

### Bestanden
- `src/components/CartDrawer.tsx`
- `src/integrations/sellqo/hooks.ts` en/of `src/integrations/sellqo/client.ts`
- `supabase/functions/sellqo-proxy/index.ts`

### Verwacht resultaat
- checkout werkt op live VanXcel-domeinen
- preview breekt checkout niet meer door een foute return URL
- als het daarna nog fout loopt, hebben we een harde, bruikbare fout voor SellQo in plaats van giswerk
