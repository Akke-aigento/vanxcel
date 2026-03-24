

## Fix: HTML in categorie-beschrijvingen renderen

### Probleem
De `description` van collecties bevat HTML-tags (`<strong>`, `<p>`, `<br>`, etc.) vanuit SellQo, maar wordt als plain text gerenderd met `{col.description}`.

### Oplossing
Vervang de `<p>{col.description}</p>` door een `<div dangerouslySetInnerHTML={{ __html: col.description }} />` zodat de HTML correct gerenderd wordt. Voeg een `prose` class toe voor nette typografie.

### Bestand
| Bestand | Actie |
|---|---|
| `src/pages/Categories.tsx` | Regel 78-79: `dangerouslySetInnerHTML` gebruiken ipv tekst-interpolatie |

