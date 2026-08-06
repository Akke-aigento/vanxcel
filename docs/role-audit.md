# Role audit / architecture log

## Autoscroll-race bij navigatie

`ScrollToTop` scrollde bij pathname-wissel terwijl `AnimatedOutlet` de oude pagina nog 250ms in de DOM hield,
dus de reset vuurde op de oude content. Opgelost door `window.scrollTo({top:0,behavior:"auto"})` direct na
`setDisplayChildren(children)` in de exit-timeout van `AnimatedOutlet`. `ScrollToTop` blijft als vangnet.

## Productbeschrijving werd afgekapt

`ProductDetail` toonde `plainDescription.slice(0,300)` met `line-clamp-4` en negeerde `short_description`.
Nu: short_description als intro-paragraaf plus de volledige lange beschrijving, HTML gestript (block-tags naar
newlines) en gerenderd met `whitespace-pre-line` — geen `dangerouslySetInnerHTML`.

## Cookie-consent banner toegevoegd

Nieuw `src/components/CookieConsent.tsx`, gemount in `App.tsx`. Keuze (accepted/rejected + timestamp) in
localStorage onder `vanxcel_cookie_consent`, in try/catch. Link naar het cookiebeleid komt uit de bestaande
`/legal`-lijst via `sellqoFetch`; ontbreekt die page, dan tekst zonder dode link. Geen externe cookie-library.



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

## Cart-id reactiviteit (add-to-cart bug)

Add-to-cart vulde het mandje niet bij een verse sessie omdat `useCartQuery()` de cart-id niet-reactief las
(`getStoredCartId()` direct uit localStorage → `enabled: false`, geen re-render na `storeCartId()`).
Opgelost met een event-gedreven `useStoredCartId()` (custom `vanxcel-cart-id-changed` event + `storage` event),
zodat de query automatisch herstart zodra de cart-id in localStorage verschijnt. API-laag en `normalizeCart` bleven ongewijzigd.

## Cart-id persistentie (race bij eerste add-to-cart)

De cart-id werd bij de eerste add-to-cart niet betrouwbaar opgeslagen door een race op de geneste
`useCreateCart.onSuccess`: de add-item-call en query-reads liepen vóór/naast `storeCartId()`, waardoor na
een refresh geen id in localStorage stond en het mandje leeg leek. Opgelost door `storeCartId()` expliciet
en synchroon in de `useAddToCart` mutationFn aan te roepen direct na cart-aanmaak, plus een herbevestiging
in `onSuccess` met de cart-id uit de respons.

## Newsletter-signup via verkeerde proxy

Newsletter-signup faalde stil (400) omdat `Newsletter.tsx` via de customer-proxy
(`storefront-customer-api`) subscribete i.p.v. de storefront-proxy; omgelegd naar
`sellqoFetch('/newsletter')`. Live geverifieerd dat subscribers nu in SellQo
`newsletter_subscribers` onder de VanXcel-tenant landen.

## Legal pages als eigen route

Legal pages worden nu gerenderd als eigen VanXcel-route `/legal/:slug` in huisstijl (HTML uit SellQo via
`/sellqo-proxy/legal/<slug>`, gestylede `.legal-content` in `index.css`). De footer is omgelegd van externe
`<a target="_blank">` naar interne `<Link to="/legal/:slug">`; socials komen via `/settings` automatisch mee.
