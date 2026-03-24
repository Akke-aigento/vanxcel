

## Navbar: Shop dropdown fix + Tools dropdown + volgorde

### Problemen
1. **Shop dropdown**: klikken op "Shop" triggert navigatie naar `/shop` — de dropdown opent maar je navigeert meteen weg. Fix: maak de trigger een `<button>` ipv `<Link>`, zodat klikken alleen de dropdown opent (niet navigeert). "Alle producten" in de dropdown linkt naar `/shop`.
2. **Tools** is nu een gewone link — moet ook een dropdown worden net als Shop, met: "Alle tools" → `/calculator`, dan de 3 tabs als items (Power Calculator → `/calculator`, Kabelberekening → `/calculator?tab=cable`, Pakketsimulator → `/calculator?tab=build`).
3. **Volgorde**: Home moet altijd het meest links staan.

### Aanpassingen in `src/components/Navbar.tsx`

**Desktop nav volgorde** (links naar rechts):
1. Home (gewone link)
2. Shop (dropdown — trigger is `<button>`, niet `<Link>`)
3. Tools (dropdown — zelfde patroon als Shop)
4. Over ons (scroll link)
5. Contact (gewone link)

**Shop dropdown trigger**: vervang `<Link to="/shop">` door `<button>` met dezelfde styling. De dropdown bevat al "Alle producten" als eerste item die naar `/shop` linkt.

**Tools dropdown** (nieuw, zelfde CSS-patroon als Shop):
- "Alle tools" → `/calculator`
- Scheidingslijn
- "⚡ Power Calculator" → `/calculator`
- "🔌 Kabelberekening" → `/calculator?tab=cable`
- "🛠️ Pakketsimulator" → `/calculator?tab=build`

**Mobiel menu**: Tools krijgt ook een expandable sectie (zelfde patroon als Shop mobile). Verwijder Tools uit `navLinks` array.

**`navLinks` array** wordt:
```ts
[
  { label: t("nav.home"), href: "/" },
  { label: t("nav.about"), href: "/#about" },
  { label: t("nav.contact"), href: "/contact" },
]
```

Shop en Tools worden apart gerenderd als dropdowns, vóór de navLinks.

### i18n keys toevoegen
- `nav.allTools` — "Alle tools" / "All tools" / "Tous les outils" / "Alle Tools"

### Bestanden
| Bestand | Actie |
|---|---|
| `src/components/Navbar.tsx` | Shop trigger → button, Tools dropdown, volgorde fix |
| `src/i18n/locales/{nl,en,fr,de}.json` | `nav.allTools` key toevoegen |

