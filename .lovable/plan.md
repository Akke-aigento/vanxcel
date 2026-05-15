## Doel

`vanxcel.nl` en `vanxcel.com` op dezelfde manier in Google Search Console krijgen als `vanxcel.be`, plus een kleine SEO-fix zodat Google weet dat het 3 taal-/regionale versies van dezelfde site zijn (geen duplicate content).

## Context

Je hebt 3 domeinen die allemaal naar deze Lovable-app wijzen:
- `vanxcel.be` → Nederlands (BE) — ✅ al geverifieerd & sitemap ingediend
- `vanxcel.nl` → Nederlands (NL) — ❌ nog niets
- `vanxcel.com` → Engels — ❌ nog niets

Google behandelt deze als 3 aparte properties. Zonder verificatie zie je voor `.nl` en `.com` geen zoekdata, geen indexstatus, geen crawl-errors.

## Stappen

### 1. Verificatie-tags ophalen voor beide domeinen
Ik vraag bij Google twee aparte `<meta name="google-site-verification">` tokens op — één voor `https://vanxcel.nl/` en één voor `https://vanxcel.com/`.

### 2. Beide tags toevoegen aan `index.html`
Beide meta-tags komen naast de bestaande `vanxcel.be`-tag in `<head>`. Google negeert tags die niet bij het huidige hostname horen, dus alle 3 mogen tegelijk in dezelfde HTML staan. Geen conditionele logica nodig.

### 3. Sitemap-generator aanpassen voor multi-domain
De huidige `scripts/generate-sitemap.ts` gebruikt één `BASE_URL` (`vanxcel.be`). Ik pas hem aan zodat hij **3 sitemaps** genereert:
- `public/sitemap.xml` — voor `vanxcel.be` (huidige, blijft werken)
- `public/sitemap-nl.xml` — voor `vanxcel.nl`
- `public/sitemap-com.xml` — voor `vanxcel.com`

Elke sitemap bevat dezelfde routes maar met de juiste domain prefix.

### 4. Hreflang-tags toevoegen via `useDocumentTitle`
Dit is de **belangrijkste SEO-fix**: zonder hreflang ziet Google `vanxcel.be/shop`, `vanxcel.nl/shop` en `vanxcel.com/shop` als duplicate content en straft 2 van de 3 af. Met hreflang weet Google: "deze 3 URLs zijn vertalingen/regionale varianten van elkaar".

Ik voeg toe aan elke pagina:
```html
<link rel="alternate" hreflang="nl-BE" href="https://vanxcel.be/{pad}" />
<link rel="alternate" hreflang="nl-NL" href="https://vanxcel.nl/{pad}" />
<link rel="alternate" hreflang="en"    href="https://vanxcel.com/{pad}" />
<link rel="alternate" hreflang="x-default" href="https://vanxcel.com/{pad}" />
```

De canonical blijft per hostname zelf-referentieel (elke versie verwijst naar zichzelf, niet naar `.be`). Dat is de Google-aanbevolen aanpak voor regionale varianten.

### 5. Publiceren (jij)
Eén publish-klik en alle 3 de tags + nieuwe sitemaps staan live op alle 3 de domeinen.

### 6. Verificatie + sitemap-submission triggeren
Ik roep voor beide nieuwe domeinen:
- `siteVerification/v1/webResource` (verificatie)
- `webmasters/v3/sites/...` (toevoegen aan property-lijst)
- `sitemaps/...` (sitemap indienen)

## Resultaat

In Search Console zie je daarna 3 properties:
- `https://vanxcel.be/` (al actief)
- `https://vanxcel.nl/` (nieuw)
- `https://vanxcel.com/` (nieuw)

Elk met eigen zoekdata per regio. Dankzij hreflang ranken ze niet tegen elkaar — Google toont automatisch de juiste versie aan een Nederlandse, Belgische of Engelstalige zoeker.

## Bestanden die wijzigen

- `index.html` — 2 extra `<meta name="google-site-verification">` tags
- `src/hooks/use-document-title.ts` — hreflang `<link>` tags toevoegen
- `scripts/generate-sitemap.ts` — uitbreiden naar 3 sitemap-bestanden
- `public/robots.txt` — verwijzingen naar de 2 nieuwe sitemaps

## Open vraag

Voor `vanxcel.com` — moet ik `hreflang="en"` (algemeen Engels) gebruiken, of specifieker `en-US` / `en-GB`? Standaard is `en` + `x-default` het veiligst voor een internationaal `.com`-domein, dus daar ga ik mee verder tenzij je een specifieke markt target.
