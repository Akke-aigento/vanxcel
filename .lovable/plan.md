

## Fix: Console log toevoegen voor QR data debugging

### Analyse

De volledige keten is al correct geimplementeerd:
- `CheckoutContext.tsx`: geeft `qr_data` en `bank_details` door via navigate state
- `QRPayment.tsx`: leest beide correct uit met `useRef` voor persistentie
- QR rendering: `QRCodeSVG` met payload, fallback naar image_url
- Bankgegevens: getoond als fallback sectie
- Types: correct gedefinieerd
- Proxy: stuurt volledige response door

### Enige wijziging

**`src/pages/QRPayment.tsx`** — Voeg een debug `console.log` toe in een `useEffect` zodat je in de browser console kunt zien wat er binnenkomt:

```typescript
useEffect(() => {
  console.log('[QRPayment] page state:', {
    orderNumber: s?.orderNumber,
    total: s?.total,
    currency: s?.currency,
    qrData: s?.qrData,
    bankDetails: s?.bankDetails,
  });
}, []);
```

Dit is de enige manier om te bevestigen of het probleem aan de frontend-kant zit (data komt niet binnen) of aan de API-kant (data wordt niet gestuurd). Als de log `qrData: undefined` toont, dan stuurt de SellQo API het niet mee. Als het gevuld is, dan werkt alles.

### Bestanden (1)
- `src/pages/QRPayment.tsx`

