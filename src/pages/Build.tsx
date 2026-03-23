import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";

const usageTypes = [
  { id: "dagtripje", emoji: "🚐", title: "Dagtripjes", desc: "Af en toe een weekend weg", multiplier: 1 },
  { id: "weekend", emoji: "🏕️", title: "Weekend Warrior", desc: "Regelmatig 2-3 dagen off-grid", multiplier: 1.5 },
  { id: "fulltime", emoji: "🌍", title: "Full-time Vanlifer", desc: "Altijd onderweg, altijd stroom nodig", multiplier: 2 },
  { id: "vast", emoji: "🔌", title: "Vaste Installatie", desc: "Cabin, boot of tiny house", multiplier: 2.5 },
];

const appliances = [
  { id: "led", emoji: "💡", name: "LED Verlichting", wh: 30 },
  { id: "laptop", emoji: "💻", name: "Laptop", wh: 50 },
  { id: "gsm", emoji: "📱", name: "GSM laden", wh: 10 },
  { id: "koelkast", emoji: "❄️", name: "Koelkast 12V", wh: 80 },
  { id: "koffie", emoji: "☕", name: "Koffiezetapparaat", wh: 150 },
  { id: "ventilator", emoji: "🌀", name: "Ventilator", wh: 25 },
  { id: "tv", emoji: "📺", name: "TV/Beeldscherm", wh: 60 },
  { id: "game", emoji: "🎮", name: "Game console", wh: 40 },
  { id: "cpap", emoji: "💈", name: "CPAP machine", wh: 35 },
  { id: "omvormer", emoji: "🔌", name: "Zware omvormerbelasting", wh: 200 },
];

const solarOptions = [
  { id: "vast", emoji: "☀️", title: "Ja, vast gemonteerd", desc: "Ik rijd weinig, panels laden goed", offset: 0.4, hasPanels: true },
  { id: "draagbaar", emoji: "🔄", title: "Ja, draagbaar", desc: "Ik gebruik ze situationeel", offset: 0.2, hasPanels: true },
  { id: "nee", emoji: "❌", title: "Nee", desc: "Ik laad enkel via netstroom of alternator", offset: 0, hasPanels: false },
];

const stepLabels = ["Gebruik", "Apparaten", "Zonne-energie", "Resultaat"];

const Build = () => {
  const [step, setStep] = useState(0);
  const [usage, setUsage] = useState<string | null>(null);
  const [selectedAppliances, setSelectedAppliances] = useState<string[]>([]);
  const [solar, setSolar] = useState<string | null>(null);
  const [solarWp, setSolarWp] = useState(200);

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
  if (adjustedWh < 400 && dailyWh < 300) {
    kitRec = "TheSMALL Kit 1000W + 200Ah";
    kitSlug = "thesmall";
  } else if (adjustedWh < 400) {
    kitRec = "TheSMALL Kit 1000W + 300Ah";
    kitSlug = "thesmall";
  } else if (dailyWh < 300) {
    kitRec = "TheBIG Kit 1500W + 200Ah";
    kitSlug = "thebig";
  } else {
    kitRec = "TheBIG Kit 1500W + 300Ah";
    kitSlug = "thebig";
  }

  const autonomyDays = adjustedWh > 0 ? ((batteryRec * 12 * 0.95) / adjustedWh).toFixed(1) : "∞";

  // Alt recommendation
  let altKit: string;
  let altSlug: string;
  if (kitSlug === "thesmall") {
    altKit = dailyWh < 300 ? "TheBIG Kit 1500W + 200Ah" : "TheBIG Kit 1500W + 300Ah";
    altSlug = "thebig";
  } else {
    altKit = adjustedWh < 400 ? "TheSMALL Kit 1000W + 200Ah" : "TheSMALL Kit 1000W + 300Ah";
    altSlug = "thesmall";
  }

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
        {/* Header */}
        <div className="text-center py-16">
          <h1 className="font-display text-[56px] leading-none text-foreground mb-4">BOUW JE SYSTEEM</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Beantwoord 4 vragen en we vinden het perfecte off-grid pakket voor jou.
          </p>
        </div>

        {/* Step indicator */}
        <div className="max-w-lg mx-auto mb-12 px-4">
          <div className="flex items-center justify-between">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      i < step
                        ? "bg-primary text-primary-foreground"
                        : i === step
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {i < step ? <Check size={16} /> : i + 1}
                  </div>
                  <span className={`text-xs mt-2 ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </div>
                {i < 3 && (
                  <div className={`flex-1 h-px mx-2 ${i < step ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="max-w-2xl mx-auto px-4 pb-24">
          <div key={step} className="animate-fade-in-up">
            {/* STEP 1 */}
            {step === 0 && (
              <div>
                <h2 className="font-display text-[32px] text-foreground text-center mb-8">
                  HOE GEBRUIK JIJ JE CAMPER?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {usageTypes.map(u => (
                    <button
                      key={u.id}
                      onClick={() => setUsage(u.id)}
                      className={`p-8 rounded-2xl text-center transition-all border-2 cursor-pointer ${
                        usage === u.id
                          ? "border-accent bg-accent/5"
                          : "border-border bg-card hover:border-muted-foreground/20"
                      }`}
                    >
                      <span className="text-4xl block mb-3">{u.emoji}</span>
                      <p className="text-foreground font-semibold">{u.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{u.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 1 && (
              <div>
                <h2 className="font-display text-[32px] text-foreground text-center mb-8">
                  WELKE APPARATEN GEBRUIK JE?
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {appliances.map(a => (
                    <button
                      key={a.id}
                      onClick={() => toggleAppliance(a.id)}
                      className={`p-4 rounded-xl text-center transition-all border-2 cursor-pointer ${
                        selectedAppliances.includes(a.id)
                          ? "border-accent bg-accent/10"
                          : "border-border bg-card hover:border-muted-foreground/20"
                      }`}
                    >
                      <span className="text-[28px] block mb-1">{a.emoji}</span>
                      <p className="text-sm font-semibold text-foreground">{a.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.wh}Wh/dag</p>
                    </button>
                  ))}
                </div>
                {selectedAppliances.length > 0 && (
                  <p className="text-center mt-6 text-accent font-semibold">
                    Geschat dagverbruik: {dailyWh} Wh/dag
                  </p>
                )}
              </div>
            )}

            {/* STEP 3 */}
            {step === 2 && (
              <div>
                <h2 className="font-display text-[32px] text-foreground text-center mb-8">
                  HEB JE ZONNEPANELEN?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {solarOptions.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSolar(s.id)}
                      className={`p-8 rounded-2xl text-center transition-all border-2 cursor-pointer ${
                        solar === s.id
                          ? "border-accent bg-accent/5"
                          : "border-border bg-card hover:border-muted-foreground/20"
                      }`}
                    >
                      <span className="text-4xl block mb-3">{s.emoji}</span>
                      <p className="text-foreground font-semibold">{s.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                    </button>
                  ))}
                </div>
                {solar && solarObj?.hasPanels && (
                  <div className="mt-8 animate-fade-in-up">
                    <label className="block text-sm text-foreground font-medium mb-2">
                      Hoeveel Wattpiek (Wp)?
                    </label>
                    <input
                      type="number"
                      value={solarWp}
                      onChange={e => setSolarWp(Number(e.target.value))}
                      className="w-full rounded-lg border border-border bg-card text-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
                      min={50}
                      max={1000}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Typisch 100-400Wp voor een campervan</p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4 — Result */}
            {step === 3 && (
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left — Recommendation */}
                  <div className="rounded-2xl border-2 border-accent bg-card p-8">
                    <p className="text-accent font-bold text-lg mb-2">⚡ Jouw ideale systeem</p>
                    <h3 className="font-display text-[32px] text-foreground leading-tight mb-6">{kitRec}</h3>
                    <Link
                      to={`/shop?collection=${kitSlug}`}
                      className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-semibold px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors"
                    >
                      Bekijk dit pakket <ArrowRight size={16} />
                    </Link>

                    <div className="grid grid-cols-3 gap-3 mt-8">
                      <div className="bg-secondary rounded-xl p-4 text-center">
                        <p className="font-display text-2xl text-accent">~{autonomyDays}</p>
                        <p className="text-xs text-muted-foreground">dagen autonomie</p>
                      </div>
                      <div className="bg-secondary rounded-xl p-4 text-center">
                        <p className="font-display text-2xl text-primary">{Math.round(adjustedWh)}</p>
                        <p className="text-xs text-muted-foreground">Wh/dag</p>
                      </div>
                      <div className="bg-secondary rounded-xl p-4 text-center">
                        <p className="font-display text-2xl text-foreground">{batteryRec}</p>
                        <p className="text-xs text-muted-foreground">Ah batterij</p>
                      </div>
                    </div>
                  </div>

                  {/* Right — Summary */}
                  <div>
                    <div className="rounded-2xl border border-border bg-card p-8">
                      <h4 className="text-foreground font-semibold mb-4">Jouw keuzes:</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Gebruikstype</span>
                          <span className="text-foreground">{usageObj?.title}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block mb-1">Apparaten</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedAppliances.map(id => {
                              const a = appliances.find(ap => ap.id === id);
                              return (
                                <span key={id} className="text-xs bg-secondary text-foreground px-2 py-1 rounded">
                                  {a?.emoji} {a?.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dagverbruik</span>
                          <span className="text-accent font-semibold">{dailyWh} Wh</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Zonne-energie</span>
                          <span className="text-foreground">{solarObj?.title}</span>
                        </div>
                      </div>
                    </div>

                    {/* Alternative */}
                    <div className="rounded-2xl border border-border bg-card p-6 mt-4">
                      <p className="text-sm text-muted-foreground mb-1">Alternatief:</p>
                      <p className="text-foreground font-semibold">{altKit}</p>
                      <Link
                        to={`/shop?collection=${altSlug}`}
                        className="text-sm text-primary hover:underline mt-2 inline-block"
                      >
                        Bekijk dit pakket →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-12">
            {step > 0 && step < 4 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={16} /> Terug
              </button>
            ) : step === 3 ? (
              <button
                onClick={() => setStep(0)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={16} /> Aanpassen
              </button>
            ) : <div />}

            {step < 3 && (
              <button
                onClick={() => canNext(step) && setStep(s => s + 1)}
                disabled={!canNext(step)}
                className={`flex items-center gap-2 font-semibold px-6 py-3 rounded-lg transition-colors ${
                  canNext(step)
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : "bg-secondary text-muted-foreground cursor-not-allowed"
                }`}
              >
                {step === 2 ? "Resultaat bekijken" : "Volgende"} <ArrowRight size={16} />
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
