# Role audit / architecture log

## 2026-08-06 — Handleidingen-sectie met beheer (self-contained in VanXcel)

**Root cause / aanleiding.** `/manuals` was een statische placeholder ("mail ons").
Handleidingen werden ad hoc per e-mail verstuurd, dus er bestond geen bron van
waarheid en geen manier om documentatie te publiceren zonder een deploy. De
verleiding was om dit in SellQo core te bouwen (product-assets), maar dat zou het
SellQo-contract wijzigen voor één tenant. Bewuste keuze: **volledig self-contained
in VanXcel's eigen Supabase**; SellQo wordt uitsluitend read-only geconsumeerd via
de bestaande proxies (`sellqo-proxy` voor de catalogus, `sellqo-customer-proxy`
voor identiteit).

**Nieuw.**
- Tabel `public.product_manuals` — `product_sku` + `product_name` als **snapshot**
  (geen FK naar SellQo; SellQo leeft in een andere database, een join bestaat niet).
  Velden: `language` (check nl/en/fr/de), `title`, `storage_path`, `file_size`,
  `sort_order`, `is_published`, timestamps + `updated_at`-trigger.
- Private storage bucket `product-manuals`. **Niet public**; geen storage-policies
  voor anon/authenticated. Alle toegang loopt via signed URL uit de edge function.
- RLS: één policy, `SELECT` voor `anon` + `authenticated` waar `is_published = true`.
  Geen insert/update/delete policies — writes lopen uitsluitend via de edge function
  met de service-role (die RLS bypasst). Grants: `SELECT` aan anon/authenticated,
  `ALL` aan service_role.
- Edge function `vanxcel-manuals-admin`.

**Owner-gate (de kern).** VanXcel gebruikt geen Supabase Auth; identiteit komt van
SellQo storefront-auth (`x-storefront-token`). De edge function doet daarom per
request een upstream `get_profile` naar `storefront-customer-api` (zelfde patroon
en tenant-remap als `sellqo-customer-proxy`, met `SELLQO_API_KEY`) en vergelijkt
`customer.email` case-insensitive met het secret `ADMIN_EMAIL`. Geen match →
`403`. Er is bewust **geen rollen-tabel**: de rol wordt afgeleid uit de upstream
identiteit, dus er valt lokaal niets te escaleren. De frontend-gate op
`/beheer/handleidingen` is puur UX; de echte bescherming is server-side.

**`get_download_url` is bewust publiek** — maar de function verifieert server-side
dat de opgevraagde `storage_path` bij een rij hoort met `is_published = true`
(uitzondering: de owner mag ook drafts previewen). Zo kan een pad uit de publieke
lijst nooit gebruikt worden om een unpublished document te trekken.

**Signed URLs.** TTL 300s, uitsluitend in de HTTP-response. De DB bevat alleen
`storage_path`. Dit is de expliciete les uit het eerdere SellQo-incident waar een
signed URL met 24u TTL werd weggeschreven en maanden later stil doodliep.

**Frontend.** `/manuals` leest de gepubliceerde rijen rechtstreeks met de anon
client (RLS filtert), met een product-filter (distinct product_name van rijen die
er effectief zijn — nooit de hele catalogus) en een **losstaande** taalfilter:
`i18n.language` stuurt de UI-taal aan, niet de documenttaal. Downloads gebruiken
het popup-safe patroon (window synchroon openen binnen de click, vóór de await).
`/beheer/handleidingen` voedt zijn productdropdown uit de echte catalogus via
`sellqo-proxy` en slaat sku + naam op als snapshot.

**Nog te doen door de eigenaar.** Secret `ADMIN_EMAIL` zetten in Project Settings →
Secrets; zonder dat secret geeft elke admin-actie `403` (fail-closed, bewust).
