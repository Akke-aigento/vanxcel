import { useState } from "react";
import { useTranslation } from "react-i18next";
import RevealOnScroll from "./RevealOnScroll";

const PowerCalculator = () => {
  const { t } = useTranslation();

  const appliances = [
    { name: t("appliances.led"), watts: 10, icon: "💡" },
    { name: t("appliances.fridge"), watts: 50, icon: "❄️" },
    { name: t("appliances.laptop"), watts: 65, icon: "💻" },
    { name: t("appliances.phone"), watts: 15, icon: "📱" },
    { name: t("appliances.waterPump"), watts: 40, icon: "🚰" },
    { name: t("appliances.fan"), watts: 25, icon: "🌀" },
    { name: t("appliances.heater"), watts: 30, icon: "🔥" },
    { name: t("appliances.tv"), watts: 60, icon: "📺" },
  ];

  const [selected, setSelected] = useState<Record<string, { hours: number }>>({});

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[name]) {
        delete next[name];
      } else {
        next[name] = { hours: 4 };
      }
      return next;
    });
  };

  const setHours = (name: string, hours: number) => {
    setSelected((prev) => ({ ...prev, [name]: { hours } }));
  };

  const totalWh = appliances.reduce((sum, app) => {
    if (selected[app.name]) {
      return sum + app.watts * selected[app.name].hours;
    }
    return sum;
  }, 0);

  const recommendedAh = Math.ceil(totalWh / 12.8 / 0.8);
  const recommendation =
    recommendedAh <= 100
      ? t("calculator.rec100")
      : recommendedAh <= 200
        ? t("calculator.rec200")
        : t("calculator.rec300");

  return (
    <section id="calculator" className="bg-background py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <RevealOnScroll direction="up">
          <h2 className="font-display text-4xl md:text-5xl text-center text-foreground mb-4">
            {t("calculator.title")}
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            {t("calculator.subtitle")}
          </p>
        </RevealOnScroll>

        <RevealOnScroll direction="up" delay={150}>
          <div className="bg-surface-elevated border border-border rounded-lg p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {appliances.map((app) => {
                const isActive = !!selected[app.name];
                return (
                  <div
                    key={app.name}
                    className={`flex items-center justify-between p-4 rounded border transition-all cursor-pointer ${
                      isActive
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                    onClick={() => toggle(app.name)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{app.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{app.name}</p>
                        <p className="text-xs text-muted-foreground">{app.watts}W</p>
                      </div>
                    </div>
                    {isActive && (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="range"
                          min={1}
                          max={24}
                          value={selected[app.name].hours}
                          onChange={(e) => setHours(app.name, Number(e.target.value))}
                          className="w-20 accent-primary"
                        />
                        <span className="text-xs text-primary font-semibold w-8">
                          {selected[app.name].hours}h
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-display text-accent">{totalWh}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("calculator.whPerDay")}</p>
                </div>
                <div>
                  <p className="text-3xl font-display text-primary">{recommendedAh}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("calculator.ahNeeded")}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mt-2">{recommendation}</p>
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

export default PowerCalculator;
