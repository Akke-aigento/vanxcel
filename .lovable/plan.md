

## Fix: Vertalingen tonen Engels i.p.v. Nederlands

### Root cause
De `i18next` LanguageDetector checkt `localStorage` → `navigator` (browsertaal). De meeste browsers hebben `en` als taal, dus i18next kiest Engels. De `fallbackLng: 'nl'` werkt alleen als er GEEN taal gedetecteerd wordt — maar `navigator` vindt altijd iets.

### Oplossing
Wijzig `src/i18n/index.ts`:

1. Voeg een **custom detector** toe die het hostname checkt als EERSTE prioriteit in de detectie-volgorde
2. De detectie-volgorde wordt: `localStorage` → `hostname` → `navigator`
3. Op `.app` domeinen (preview, lovable.app) → `nl`
4. Op `.com` → `en`, `.de` → `de`, `.fr` → `fr`
5. Alles anders (`.nl`, `.be`) → `nl`

Dit zorgt ervoor dat:
- Nieuwe bezoekers de juiste taal zien op basis van het domein
- Terugkerende bezoekers die de taalswitch gebruikt hebben, hun keuze behouden (localStorage)
- De browsertaal alleen als allerlaatste fallback dient

### Bestand

| Bestand | Wijziging |
|---|---|
| `src/i18n/index.ts` | Custom hostname detector toevoegen aan detectie-volgorde |

