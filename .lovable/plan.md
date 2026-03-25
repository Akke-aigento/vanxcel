

## Fix resterende veiligheidshiaten

### Probleem
Na grondige audit zijn er 2 functionele problemen gevonden:

1. **Chassis-aarding ontbreekt** in de bekabelingstabel — er is geen rij voor "Batterij → Chassis aarding" (min 25mm²). Dit is een kritiek circuit.
2. **StepPackage iconMap** mist `power` en `minus` entries — de Battery Disconnect Switch en Negatieve Busbar tonen geen icoon.

De overige veiligheidslogica (kabeldiktes, zekeringen, banners, disclaimer, DC-DC sizing, piekstroom) is correct geïmplementeerd.

### Aanpak

**1. Chassis-aarding rij toevoegen aan bekabelingstabel (`StepInstallGuide.tsx`)**

Voeg een nieuwe rij toe aan `cablingRows`:
- Circuit: `battery_to_chassis`
- Van: Batterij → Chassis aarding
- Afstand: 0.3m
- Amps: gelijk aan de zwaarste negatieve kabel (omvormer of hoofd)
- Minimum: altijd 25mm²
- Type: Negatief (aarding)

Voeg `battery_to_chassis` case toe aan `getMinCableSize()` → altijd 25mm².

**2. Fix iconMap in StepPackage.tsx**

Voeg `power` en `minus` toe aan de `iconMap`:
```
power: <Power className="w-5 h-5" />
minus: <Minus className="w-5 h-5" />
```

### Bestanden

| Bestand | Wijziging |
|---|---|
| `src/components/configurator/StepInstallGuide.tsx` | Chassis-aarding rij + `getMinCableSize` case |
| `src/components/configurator/StepPackage.tsx` | `power` en `minus` in iconMap |
| `src/i18n/locales/nl.json` | Key `cableChassisGround` |
| `src/i18n/locales/en.json` | Key `cableChassisGround` |
| `src/i18n/locales/fr.json` | Key `cableChassisGround` |
| `src/i18n/locales/de.json` | Key `cableChassisGround` |

