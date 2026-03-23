import { Shield, Truck, Phone, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

const TrustBar = () => {
  const { t } = useTranslation();

  const usps = [
    { icon: Shield, label: t("trust.warranty") },
    { icon: Truck, label: t("trust.shipping") },
    { icon: Phone, label: t("trust.support") },
    { icon: RotateCcw, label: t("trust.returns") },
  ];

  return (
    <section className="bg-secondary border-y border-border">
      <div className="container mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        {usps.map((usp) => (
          <div key={usp.label} className="flex items-start md:items-center md:justify-center gap-3">
            <usp.icon size={18} className="text-primary shrink-0 mt-0.5 md:mt-0" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-left md:text-center">
              {usp.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustBar;
