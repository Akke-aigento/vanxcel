

## Contact Page Implementation

### 1. Create `src/pages/Contact.tsx`
- Form with fields: Naam, E-mail, Onderwerp, Bericht (all required)
- Use existing UI components: Input, Textarea, Button, Card
- Submit via `sellqoFetch('/contact', { method: 'POST', body: JSON.stringify({ name, email, subject, message }) })`
- On success: show inline success message, reset form
- On error: show toast notification
- Client-side validation with required checks before submit
- Match existing dark theme styling

### 2. Update `src/App.tsx`
- Import Contact page, add `<Route path="/contact" element={<Contact />} />`

### 3. Update `src/components/Navbar.tsx`
- Change Contact nav link href from `#contact` to `/contact`

