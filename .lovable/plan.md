

## Dynamic Footer with SellQo Data

### Changes

**1. `src/components/Footer.tsx`** — Rewrite as a stateful component:
- Fetch legal pages via `sellqoFetch('/legal')` and settings via `sellqoFetch('/settings')` using `useEffect`
- **Brand column**: Use `settings.data.shop_name` instead of hardcoded "VANXCEL"
- **Shop column**: Keep static category links (unchanged)
- **Legal column**: Replace hardcoded Info links with dynamic legal pages, rendered as `<a href={page.url + '?from=https%3A%2F%2Fwww.vanxcel.be%2F'}>`
- **Social column**: Render only non-null/non-empty social links from `settings.data.social` using Lucide icons:
  - `Instagram` icon for instagram
  - `Facebook` icon for facebook
  - `Twitter` icon for twitter/X
  - `Youtube` icon for youtube
  - TikTok: use a simple text label (no Lucide icon available)
- Copyright line uses `shop_name` dynamically

**2. `src/integrations/sellqo/types.ts`** — Add interfaces:
- `LegalPage { title: string; url: string; slug: string }`
- `SocialLinks { instagram?: string; tiktok?: string; facebook?: string; twitter?: string; youtube?: string }`
- Update `StoreSettings` to include `social?: SocialLinks` and `shop_name?: string`

No other files need changes.

