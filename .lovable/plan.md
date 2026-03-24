

## Verwijder bevestigings-tussenstappen uit Configurator

### Probleem
SubStep 9 ("step2Complete") en subStep 11 ("step3Complete") zijn overbodige bevestigingsschermen die de flow vertragen.

### Nieuwe subStep nummering

| subStep | Inhoud | Was |
|---|---|---|
| 0-5 | Voertuig selectie (ongewijzigd) | 0-5 |
| 6 | UsageType | 6 |
| 7 | Climate | 7 |
| 8 | Persons → **direct door naar 9** | 8 |
| 9 | Appliances | was 10 |
| 10 | Results | was 12 |
| 11 | Package | was 13 |
| 12 | InstallGuide | was 14 |

### Wijzigingen

| Bestand | Wat |
|---|---|
| `ConfiguratorWizard.tsx` | Verwijder subStep 9 en 11 blokken. Hernummer: `selectPersons` → subStep 9, `completeAppliances` → subStep 10. Update alle `goTo()` calls en subStep checks. |
| `VehicleSummaryBar.tsx` | Update step nummers in crumbs (10→9, 12→10, 13→11, 14→12) |
| `StepResults.tsx` | `onBack`/`onAdjustAppliances` targets bijwerken (als die vanuit Wizard komen, hoeft dit component zelf niet te veranderen) |

Alle navigatie-callbacks (`onBack`, `onNext`, `goTo`) worden aangepast naar de nieuwe nummering. De componenten zelf (StepAppliances, StepResults, etc.) hoeven intern niet te veranderen — alleen de step nummers in de Wizard en SummaryBar.

