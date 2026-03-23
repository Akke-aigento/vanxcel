

## Fix: Navbar navigatie werkt niet op subpagina's

### Probleem

De Navbar gebruikt `<a href="#">` en `<a href="#products">` — dit zijn anchor/hash links die alleen werken op de homepage. Op `/contact`, `/calculator` etc. navigeren ze niet terug naar `/`.

### Oplossing

**`src/components/Navbar.tsx`:**
- Gebruik React Router's `Link` (of `useNavigate`) in plaats van `<a href="...">`
- Verander hash-links naar volledige paden:
  - `#` → `/`
  - `#products` → `/#products`
  - `#about` → `/#about`
- Links die al een pad hebben (`/calculator`, `/contact`) blijven hetzelfde
- Voor hash-links naar secties op de homepage (`/#products`, `/#about`): navigeer eerst naar `/` en scroll dan naar het element

