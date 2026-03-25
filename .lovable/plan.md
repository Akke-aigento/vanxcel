

## Modellen Chronologisch Sorteren

### Probleem
`useVehiclesByBrand` sorteert op `popularity_rank`. Hierdoor staan modellen niet chronologisch op bouwjaar.

### Oplossing
Wijzig in `src/hooks/use-configurator.ts` regel 32:

```typescript
// Was:
.order("popularity_rank", { ascending: true });

// Wordt:
.order("production_year_start", { ascending: true });
```

Dit sorteert modellen van oud naar nieuw (bijv. T3 → T4 → T5 → T6 → T7). Eén regel wijziging, geen andere bestanden nodig.

