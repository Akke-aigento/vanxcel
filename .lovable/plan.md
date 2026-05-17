## Favicon-pakket toepassen

### Bestanden kopiëren naar `public/`
- `favicon.ico` (overschrijft bestaande)
- `favicon.svg`
- `favicon-96x96.png`
- `apple-touch-icon.png`
- `web-app-manifest-192x192.png`
- `web-app-manifest-512x512.png`
- `site.webmanifest`

De oude `public/favicon.png` wordt verwijderd (vervangen door `favicon.ico` + nieuwe PNG's).

### `index.html` head aanpassen
Vervang de huidige enkele favicon-link door de standaard RealFaviconGenerator-set:

```html
<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-title" content="VanXcel" />
<link rel="manifest" href="/site.webmanifest" />
```

### Opmerking — PWA
`site.webmanifest` bevat `"display": "standalone"`. Dit maakt de site installeerbaar (Add to Home Screen) op mobiel, maar registreert geen service worker — dus geen risico op cache-problemen in de Lovable preview. Alleen het manifest, zoals jij hebt aangeleverd.

### Geen wijzigingen aan
- SEO-meta, hreflang, sitemaps, verificatie-tags — blijven onaangeroerd.
