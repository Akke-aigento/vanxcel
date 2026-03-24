import { Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import RevealOnScroll from "./RevealOnScroll";
import { useCountUp } from "@/hooks/use-count-up";

const AnimatedNumber = ({ text }: { text: string }) => {
  // Extract first number from text like "3.000 – 5.000+"
  const match = text.match(/[\d.]+/);
  if (!match) return <span className="text-primary font-semibold">{text}</span>;

  const num = parseInt(match[0].replace(/\./g, ""), 10);
  const { ref, value } = useCountUp(num, 1200);

  // Format with dots as thousand separator
  const formatted = value.toLocaleString("nl-NL");
  const display = text.replace(match[0], formatted);

  return (
    <span ref={ref} className="text-primary font-semibold">
      {display}
    </span>
  );
};

const ComparisonTable = () => {
  const { t } = useTranslation();

  const rows = [
    { feature: t("comparison.lifecycle"), lifepo4: "3.000 – 5.000+", agm: "300 – 500" },
    { feature: t("comparison.weight"), lifepo4: "~12 kg", agm: "~30 kg" },
    { feature: t("comparison.usableCapacity"), lifepo4: "80 – 100%", agm: "50%" },
    { feature: t("comparison.chargeSpeed"), lifepo4: t("comparison.fast"), agm: t("comparison.slow") },
    { feature: t("comparison.bms"), lifepo4: true as const, agm: false as const },
    { feature: t("comparison.maintenanceFree"), lifepo4: true as const, agm: false as const },
    { feature: t("comparison.safe"), lifepo4: true as const, agm: false as const },
    { feature: t("comparison.costPerCycle"), lifepo4: "€0,04", agm: "€0,30+" },
  ];

  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <RevealOnScroll direction="up">
          <h2 className="font-display text-4xl md:text-5xl text-center text-foreground mb-4">
            {t("comparison.title")}
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            {t("comparison.subtitle")}
          </p>
        </RevealOnScroll>

        <RevealOnScroll direction="up" delay={150}>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 border-b border-border">
              <div className="p-4" />
              <div className="p-4 text-center">
                <span className="font-display text-lg text-primary">LIFEPO4</span>
              </div>
              <div className="p-4 text-center">
                <span className="font-display text-lg text-muted-foreground">AGM</span>
              </div>
            </div>

            {rows.map((row, i) => (
              <div
                key={i}
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
                    <AnimatedNumber text={row.lifepo4} />
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
        </RevealOnScroll>
      </div>
    </section>
  );
};

export default ComparisonTable;
