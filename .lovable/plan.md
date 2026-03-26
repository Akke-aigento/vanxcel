

## Fix: Login pagina heeft geen navigatie terug

### Probleem
De Login pagina (`src/pages/Login.tsx`) is een full-screen split-screen layout zonder Navbar. De enige manier om terug te navigeren is het kleine "VANXCEL" logo-linkje. Er is geen duidelijke terug-knop of navigatiebalk.

### Oplossing
Voeg een duidelijke terug-knop toe linksboven (of rechtsboven op mobile) met een pijl-icoon en "Terug naar shop" tekst. Dit is beter dan de volledige Navbar toe te voegen — de cinematic login-ervaring blijft intact.

### Wijzigingen

**`src/pages/Login.tsx`**:
- Voeg een `ArrowLeft` terug-link toe boven het formulier (of naast het logo) die naar `/` navigeert
- Tekst: vertaald via i18n key `auth.backToShop`

**`src/i18n/locales/{nl,en,de,fr}.json`**:
- Nieuwe key `auth.backToShop`: "Terug naar shop" / "Back to shop" / "Zurück zum Shop" / "Retour à la boutique"

**`src/pages/ResetPassword.tsx`**:
- Zelfde fix toepassen (heeft waarschijnlijk ook geen navigatie)

