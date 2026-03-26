

## Fix: Navbar toevoegen aan Login & ResetPassword pagina's

### Probleem
De login/registratie pagina toont "checkout.backToShop" als raw key tekst en mist de standaard site-navigatie. De gebruiker wil gewoon de normale Navbar behouden.

### Oplossing
Voeg de `<Navbar />` component toe bovenaan Login en ResetPassword pagina's — net zoals alle andere pagina's. Verwijder de custom "terug naar shop" link en het losse VANXCEL logo, aangezien de Navbar dit al bevat.

### Wijzigingen

**`src/pages/Login.tsx`**:
- Import `Navbar` en render bovenaan
- Verwijder de `ArrowLeft` + `checkout.backToShop` link
- Verwijder het losse `VANXCEL` logo-link (Navbar heeft dit al)
- De split-screen layout blijft, maar begint nu onder de Navbar

**`src/pages/ResetPassword.tsx`**:
- Zelfde aanpak: voeg `Navbar` toe, verwijder custom terug-link en los logo

### Bestanden
| Bestand | Wijziging |
|---|---|
| `src/pages/Login.tsx` | Navbar toevoegen, custom nav verwijderen |
| `src/pages/ResetPassword.tsx` | Navbar toevoegen, custom nav verwijderen |

