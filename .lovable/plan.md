

## Contactpagina Redesign

### Huidige situatie
Een saaie witte card met 4 velden op een lege pagina. Geen visuele aantrekkingskracht, geen extra context.

### Nieuw ontwerp

**Layout: Twee-koloms (desktop) / gestapeld (mobiel)**

Linkerkolom (of boven op mobiel):
- Grote heading + subtekst
- Direct contact opties: WhatsApp knop, e-mail adres, responstijd indicator
- Kleine FAQ hints ("Gemiddelde reactietijd: < 2 uur")
- Subtle decoratieve achtergrond (gradient/glow passend bij het donkere thema)

Rechterkolom (of onder op mobiel):
- Het formulier met verbeterde styling
- **Nieuw optioneel veld: Ordernummer** (tussen subject en message)
- Betere visuele hiërarchie

**Formulier aanpassingen:**
- Nieuw veld `orderNumber` (optioneel, maxLength 50, placeholder "VX-12345")
- Wordt meegestuurd in de API call als het ingevuld is
- Niet verplicht — geen validatie nodig

### Bestanden

| Bestand | Wijziging |
|---|---|
| `src/pages/Contact.tsx` | Volledige redesign: twee-koloms layout, contactinfo links, ordernummer veld, verbeterde styling |
| `src/i18n/locales/nl.json` | Keys: `contact.orderNumber`, `contact.orderNumberPlaceholder`, `contact.orderNumberHint`, `contact.whatsapp`, `contact.responseTime`, `contact.directContact` |
| `src/i18n/locales/en.json` | Engelse vertalingen |
| `src/i18n/locales/fr.json` | Franse vertalingen |
| `src/i18n/locales/de.json` | Duitse vertalingen |

