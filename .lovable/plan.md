

## Vooruitgangsbollen layout fixen op mobiel

### Probleem
Stap 3 label ("Zonne-energie") is te lang en breekt vreemd af op 390px breed. De bollen en labels staan niet netjes uitgelijnd.

### Aanpassing in `src/components/BuildWizard.tsx`

- Geef elke stap-kolom een vaste breedte via `min-w-0 w-1/4` zodat alle 4 stappen gelijkmatig verdeeld worden
- Voeg `text-center` en `whitespace-nowrap` of `leading-tight` toe aan de labels zodat ze netjes onder de bol blijven
- Verklein de bollen op mobiel: `w-8 h-8 md:w-10 md:h-10` en tekst `text-xs md:text-sm`
- Labels: `text-[10px] md:text-xs` zodat langere woorden als "Zonne-energie" passen

### Alleen dit bestand wordt aangepast:
- `src/components/BuildWizard.tsx`

