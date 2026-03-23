import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";

const Build = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [usage, setUsage] = useState<string | null>(null);
  const [selectedAppliances, setSelectedAppliances] = useState<string[]>([]);
  const [solar, setSolar] = useState<string | null>(null);
  const [solarWp, setSolarWp] = useState(200);

  const usageTypes = [
    { id: "dagtripje", emoji: "🚐", title: t("build.dayTrips"), desc: t("build.dayTripsDesc"), multiplier: 1 },
    { id: "weekend", emoji: "🏕️", title: t("build.weekendWarrior"), desc: t("build.weekendDesc"), multiplier: 1.5 },
    { id: "fulltime", emoji: "🌍", title: t("build.fullTime"), desc: t("build.fullTimeDesc"), multiplier: 2 },
    { id: "vast", emoji: "🔌", title: t("build.fixedInstall"), desc: t("build.fixedDesc"), multiplier: 2.5 },
  ];

  const appliances = [
    { id: "led", emoji: "💡", name: t("build.led"), wh: 30 },
    { id: "laptop", emoji: "💻", name: t("build.laptop"), wh: 50 },
    { id: "gsm", emoji: "📱", name: t("build.phone"), wh: 10 },
    { id: "koelkast", emoji: "❄️", name: t("build.fridge"), wh: 80 },
    { id: "koffie", emoji: "☕", name: t("build.coffee"), wh: 150 },
    { id: "ventilator", emoji: "🌀", name: t("build.fan"), wh: 25 },
    { id: "tv", emoji: "📺", name: t("build.tv"), wh: 60 },
    { id: "game", emoji: "🎮", name: t("build.gaming"), wh: 40 },
    { id: "cpap", emoji: "💈", name: t("build.cpap"), wh: 35 },
    { id: "omvormer", emoji: "🔌", name: t("build.heavyInverter"), wh: 200 },
  ];

  const solarOptions = [
    { id: "vast", emoji: "☀️", title: t("build.solarFixed"), desc: t("build.solarFixedDesc"), offset: 0.4, hasPanels: true },
    { id: "draagbaar", emoji: "🔄", title: t("build.solarPortable"), desc: t("build.solarPortableDesc"), offset: 0.2, hasPanels: true },
    { id: "nee", emoji: "❌", title: t("build.solarNo"), desc: t("build.solarNoDesc"), offset: 0, hasPanels: false },
  ];

  const stepLabels = [t("build.stepUsage"), t("build.stepAppliances"), t("build.stepSolar"), t("build.stepResult")];

  const dailyWh = appliances.filter(a => selectedAppliances.includes(a.id)).reduce((s, a) => s + a.wh, 0);
  const usageObj = usageTypes.find(u => u.id === usage);
  const solarObj = solarOptions.find(s => s.id === solar);
  const usageMultiplier = usageObj?.multiplier ?? 1;
  const solarOffset = solarObj?.offset ?? 0;
  const adjustedWh = dailyWh * usageMultiplier * (1 - solarOffset);

  const batteryRec = adjustedWh < 400 ? 200 : 300;
  const converterRec = dailyWh < 300 ? 1000 : 1500;

  let kitRec: string;
  let kitSlug: string;
  if (adjustedWh < 400 && dailyWh < 300) { kitRec = "TheSMALL Kit 1000W + 200Ah"; kitSlug = "thesmall"; }
  else if (adjustedWh < 400) { kitRec = "TheSMALL Kit 1000W + 300Ah"; kitSlug = "thesmall"; }
  else if (dailyWh < 300) { kitRec = "TheBIG Kit 1500W + 200Ah"; kitSlug = "thebig"; }
  else { kitRec = "TheBIG Kit 1500W + 300Ah"; kitSlug = "thebig"; }

  const autonomyDays = adjustedWh > 0 ? ((batteryRec * 12 * 0.95) / adjustedWh).toFixed(1) : "∞";

  let altKit: string;
  let altSlug: string;
  if (kitSlug === "thesmall") { altKit = dailyWh < 300 ? "TheBIG Kit 1500W + 200Ah" : "TheBIG Kit 1500W + 300Ah"; altSlug = "thebig"; }
  else { altKit = adjustedWh < 400 ? "TheSMALL Kit 1000W + 200Ah" : "TheSMALL Kit 1000W + 300Ah"; altSlug = "thesmall"; }

  const canNext = (s: number) => {
    if (s === 0) return !!usage;
    if (s === 1) return selectedAppliances.length > 0;
    if (s === 2) return !!solar;
    return false;
  };

  const toggleAppliance = (id: string) => {
    setSelectedAppliances(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="text-center py-16">
          <h1 className="font-display text-[56px] leading-none text-foreground mb-4">{t("build.title")}</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">{t("build.subtitle")}</p>
        </div>

        <div className="max-w-lg mx-auto mb-12 px-4">
          <div className="flex items-center justify-between">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                  }`}>
                    {i < step ? <Check size={16} /> : i + 1}
                  </div>
                  <span className={`text-xs mt-2 ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                </div>
                {i < 3 && <div className={`flex-1 h-px mx-2 ${i < step ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-24">
          <div key={step} className="animate-fade-in-up">
            {step === 0 && (
              <div>
                <h2 className="font-display text-[32px] text-foreground text-center mb-8">{t("build.howUse")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {usageTypes.map(u => (
                    <button key={u.id} onClick={() => setUsage(u.id)}
                      className={`p-8 rounded-2xl text-center transition-all border-2 cursor-pointer ${usage === u.id ? "border-accent bg-accent/5" : "border-border bg-card hover:border-muted-foreground/20"}`}>
                      <span className="text-4xl block mb-3">{u.emoji}</span>
                      <p className="text-foreground font-semibold">{u.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{u.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="font-display text-[32px] text-foreground text-center mb-8">{t("build.whichAppliances")}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {appliances.map(a => (
                    <button key={a.id} onClick={() => toggleAppliance(a.id)}
                      className={`p-4 rounded-xl text-center transition-all border-2 cursor-pointer ${selectedAppliances.includes(a.id) ? "border-accent bg-accent/10" : "border-border bg-card hover:border-muted-foreground/20"}`}>
                      <span className="text-[28px] block mb-1">{a.emoji}</span>
                      <p className="text-sm font-semibold text-foreground">{a.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.wh}Wh/{t("calculator.whPerDay").split("/")[1]?.trim() || "dag"}</p>
                    </button>
                  ))}
                </div>
                {selectedAppliances.length > 0 && (
                  <p className="text-center mt-6 text-accent font-semibold">
                    {t("build.estimatedDaily", { wh: dailyWh })}
                  </p>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="font-display text-[32px] text-foreground text-center mb-8">{t("build.haveSolar")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {solarOptions.map(s => (
                    <button key={s.id} onClick={() => setSolar(s.id)}
                      className={`p-8 rounded-2xl text-center transition-all border-2 cursor-pointer ${solar === s.id ? "border-accent bg-accent/5" : "border-border bg-card hover:border-muted-foreground/20"}`}>
                      <span className="text-4xl block mb-3">{s.emoji}</span>
                      <p className="text-foreground font-semibold">{s.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                    </button>
                  ))}
                </div>
                {solar && solarObj?.hasPanels && (
                  <div className="mt-8 animate-fade-in-up">
                    <label className="block text-sm text-foreground font-medium mb-2">{t("build.wpLabel")}</label>
                    <input type="number" value={solarWp} onChange={e => setSolarWp(Number(e.target.value))}
                      className="w-full rounded-lg border border-border bg-card text-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring" min={50} max={1000} />
                    <p className="text-xs text-muted-foreground mt-1">{t("build.wpHint")}</p>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-2xl border-2 border-accent bg-card p-8">
                    <p className="text-accent font-bold text-lg mb-2">{t("build.idealSystem")}</p>
                    <h3 className="font-display text-[32px] text-foreground leading-tight mb-6">{kitRec}</h3>
                    <Link to={`/shop?collection=${kitSlug}`}
                      className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-semibold px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors">
                      {t("build.viewPackage")} <ArrowRight size={16} />
                    </Link>
                    <div className="grid grid-cols-3 gap-3 mt-8">
                      <div className="bg-secondary rounded-xl p-4 text-center">
                        <p className="font-display text-2xl text-accent">~{autonomyDays}</p>
                        <p className="text-xs text-muted-foreground">{t("build.daysAutonomy")}</p>
                      </div>
                      <div className="bg-secondary rounded-xl p-4 text-center">
                        <p className="font-display text-2xl text-primary">{Math.round(adjustedWh)}</p>
                        <p className="text-xs text-muted-foreground">{t("build.whDay")}</p>
                      </div>
                      <div className="bg-secondary rounded-xl p-4 text-center">
                        <p className="font-display text-2xl text-foreground">{batteryRec}</p>
                        <p className="text-xs text-muted-foreground">{t("build.ahBattery")}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="rounded-2xl border border-border bg-card p-8">
                      <h4 className="text-foreground font-semibold mb-4">{t("build.yourChoices")}</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("build.usageType")}</span>
                          <span className="text-foreground">{usageObj?.title}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block mb-1">{t("build.appliances")}</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedAppliances.map(id => {
                              const a = appliances.find(ap => ap.id === id);
                              return <span key={id} className="text-xs bg-secondary text-foreground px-2 py-1 rounded">{a?.emoji} {a?.name}</span>;
                            })}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("build.dailyUsage")}</span>
                          <span className="text-accent font-semibold">{dailyWh} Wh</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("build.solarEnergy")}</span>
                          <span className="text-foreground">{solarObj?.title}</span>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-6 mt-4">
                      <p className="text-sm text-muted-foreground mb-1">{t("build.alternative")}</p>
                      <p className="text-foreground font-semibold">{altKit}</p>
                      <Link to={`/shop?collection=${altSlug}`} className="text-sm text-primary hover:underline mt-2 inline-block">
                        {t("build.viewPackage")} →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-12">
            {step > 0 && step < 4 ? (
              <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft size={16} /> {t("build.back")}
              </button>
            ) : step === 3 ? (
              <button onClick={() => setStep(0)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft size={16} /> {t("build.adjust")}
              </button>
            ) : <div />}

            {step < 3 && (
              <button onClick={() => canNext(step) && setStep(s => s + 1)} disabled={!canNext(step)}
                className={`flex items-center gap-2 font-semibold px-6 py-3 rounded-lg transition-colors ${
                  canNext(step) ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-secondary text-muted-foreground cursor-not-allowed"
                }`}>
                {step === 2 ? t("build.viewResult") : t("build.next")} <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Build;
