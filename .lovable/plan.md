## Doel

Je VanXcel-site (vanxcel.be) volledig koppelen aan Google Search Console zodat Google je pagina's kan indexeren, je rankings ziet en zoektermen kunt analyseren.

## Stappen

### 1. Google Search Console connector koppelen
Je krijgt een prompt om je Google-account te koppelen via de **Google Search Console** connector. Dit is een eenmalige autorisatie — Lovable slaat geen wachtwoord op, alleen een veilige OAuth-token.

### 2. Verificatie-token ophalen
Na koppeling vraag ik bij Google een unieke `<meta name="google-site-verification">` tag op voor `https://vanxcel.be/`.

### 3. Meta-tag in `index.html` plaatsen
De tag wordt toegevoegd in de `<head>` van `index.html`, naast de bestaande SEO-tags.

```html
<meta name="google-site-verification" content="<token>" />
```

### 4. Publiceren
Je publiceert de site (één klik) zodat de meta-tag live staat op vanxcel.be. Dit is **vereist** — Google fetcht de live HTML om te verifiëren.

### 5. Verificatie triggeren
Ik roep Google's verify-endpoint aan. Bij succes is de site geverifieerd als jouw eigendom.

### 6. Site registreren in Search Console
De site wordt toegevoegd aan jouw Search Console property-lijst (`https://vanxcel.be/`).

### 7. Sitemap indienen
Ik dien `https://vanxcel.be/sitemap.xml` (die we vorige stap hebben aangemaakt) automatisch in bij Google zodat alle 12 routes meteen gecrawld worden.

## Wat je daarna kunt doen
- In Search Console (search.google.com/search-console) zie je binnen 1–3 dagen eerste indexering
- Zoektermen waarop je gevonden wordt, klikken, vertoningen, gemiddelde positie
- Eventuele crawl-fouten of mobile-usability issues

## Belangrijk om te weten
- **Stap 4 (publiceren) moet je zelf doen** tussen stap 3 en 5 — anders faalt verificatie met `failedToFindMetaTag`
- Verificatie geldt voor het hoofd-domein `vanxcel.be`. Als je later ook `www.vanxcel.be` of een ander subdomein wil monitoren, herhalen we stap 2–6 voor die URL
- Google indexeert niet onmiddellijk — eerste data verschijnt meestal na 24–72 uur

## Bestanden die wijzigen
- `index.html` — één extra `<meta>` regel in `<head>`

Geen wijzigingen aan backend, routes of bestaande SEO-code.
