import { Check, X } from "lucide-react";

const rows = [
  { feature: "Levensduur (cycli)", lifepo4: "3.000 – 5.000+", agm: "300 – 500" },
  { feature: "Gewicht (100Ah)", lifepo4: "~12 kg", agm: "~30 kg" },
  { feature: "Bruikbare capaciteit", lifepo4: "80 – 100%", agm: "50%" },
  { feature: "Oplaadsnelheid", lifepo4: "Snel (1C)", agm: "Langzaam" },
  { feature: "BMS ingebouwd", lifepo4: true, agm: false },
  { feature: "Onderhoudsvrij", lifepo4: true, agm: false },
  { feature: "Veilig (geen gassen)", lifepo4: true, agm: false },
  { feature: "Prijs per cyclus", lifepo4: "€0,04", agm: "€0,30+" },
];

const ComparisonTable = () => (
  <section className="bg-background py-20">
    <div className="container mx-auto px-4 max-w-3xl">
      <h2 className="font-display text-4xl md:text-5xl text-center text-foreground mb-4">
        LIFEPO4 VS AGM
      </h2>
      <p className="text-center text-muted-foreground mb-12">
        Waarom LiFePO4 de toekomst is van campervan-energie
      </p>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-3 border-b border-border">
          <div className="p-4" />
          <div className="p-4 text-center">
            <span className="font-display text-lg text-primary">LIFEPO4</span>
          </div>
          <div className="p-4 text-center">
            <span className="font-display text-lg text-muted-foreground">AGM</span>
          </div>
        </div>

        {/* Rows */}
        {rows.map((row, i) => (
          <div
            key={row.feature}
            className={`grid grid-cols-3 ${i < rows.length - 1 ? "border-b border-border" : ""} ${
              i % 2 === 0 ? "bg-card" : "bg-secondary/30"
            }`}
          >
            <div className="p-4 text-sm text-foreground font-medium">{row.feature}</div>
            <div className="p-4 text-center text-sm">
              {typeof row.lifepo4 === "boolean" ? (
                row.lifepo4 ? (
                  <Check size={18} className="inline text-primary" />
                ) : (
                  <X size={18} className="inline text-destructive" />
                )
              ) : (
                <span className="text-primary font-semibold">{row.lifepo4}</span>
              )}
            </div>
            <div className="p-4 text-center text-sm">
              {typeof row.agm === "boolean" ? (
                row.agm ? (
                  <Check size={18} className="inline text-primary" />
                ) : (
                  <X size={18} className="inline text-muted-foreground" />
                )
              ) : (
                <span className="text-muted-foreground">{row.agm}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ComparisonTable;
