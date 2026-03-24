

## Scroll naar boven bij navigatie

### Probleem
Bij het klikken op links scrollt de pagina niet naar boven — je blijft op dezelfde scroll-positie hangen.

### Oplossing
Maak een `ScrollToTop` component dat bij elke route-wijziging `window.scrollTo(0, 0)` uitvoert, en plaats dit in `src/App.tsx` binnen de `<BrowserRouter>`.

### Bestanden

| Bestand | Actie |
|---|---|
| `src/components/ScrollToTop.tsx` | Nieuw — luistert naar `useLocation()` en scrollt naar boven bij elke pathname-wijziging |
| `src/App.tsx` | Importeer en plaats `<ScrollToTop />` direct onder `<BrowserRouter>` |

