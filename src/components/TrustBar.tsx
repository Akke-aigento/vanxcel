import { Shield, Truck, Phone, RotateCcw } from "lucide-react";

const usps = [
  { icon: Shield, label: "2 Jaar Garantie" },
  { icon: Truck, label: "Gratis Verzending vanaf €25" },
  { icon: Phone, label: "Gratis WhatsApp Support" },
  { icon: RotateCcw, label: "30 Dagen Retourrecht" },
];

const TrustBar = () => (
  <section className="bg-secondary border-y border-border">
    <div className="container mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
      {usps.map((usp) => (
        <div key={usp.label} className="flex items-center justify-center gap-3">
          <usp.icon size={18} className="text-primary shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {usp.label}
          </span>
        </div>
      ))}
    </div>
  </section>
);

export default TrustBar;
