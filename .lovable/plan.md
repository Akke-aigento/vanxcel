

## Fix Sticky Header / App.css Boilerplate

### Probleem
De `App.css` bevat nog standaard Vite boilerplate CSS die de layout beïnvloedt:

```css
#root {
  max-width: 1280px;   /* ← beperkt de breedte van alles */
  margin: 0 auto;
  padding: 2rem;        /* ← voegt ongewenste ruimte toe rondom alles */
  text-align: center;   /* ← centreert alle tekst */
}
```

De navbar zelf is `fixed` en werkt technisch, maar de `#root` container beperkt de breedte en voegt padding toe, wat visuele problemen kan veroorzaken — vooral bij bepaalde schermbreedtes waar de header smaller lijkt dan het scherm.

### Oplossing

**`src/App.css`**: Verwijder alle boilerplate CSS. Dit bestand kan volledig leeggemaakt worden — alle styling zit al in `index.css` en Tailwind.

| Bestand | Wijziging |
|---|---|
| `src/App.css` | Verwijder alle inhoud (of verwijder het bestand + de import in `main.tsx`) |

