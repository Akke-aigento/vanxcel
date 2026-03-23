import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Zap } from "lucide-react";

const cableSizes = [2.5, 4, 6, 10, 16, 25, 35, 50];

const Calculator = () => {
  const [voltage, setVoltage] = useState<12 | 24>(12);
  const [inputMode, setInputMode] = useState<"watt" | "ampere">("watt");
  const [inputValue, setInputValue] = useState("");
  const [cableLength, setCableLength] = useState("");
  const [maxDrop, setMaxDrop] = useState("3");
  const [result, setResult] = useState<null | { current: number; cable: number | null; fuse: string }>(null);
  const [error, setError] = useState(false);

  const calculate = () => {
    const val = parseFloat(inputValue);
    const len = parseFloat(cableLength);
    const drop = parseFloat(maxDrop);

    if (!val || !len || !drop || val <= 0 || len <= 0 || drop <= 0) {
      setError(true);
      setResult(null);
      return;
    }

    setError(false);
    const length = len * 2;
    const current = inputMode === "watt" ? val / voltage : val;
    const maxDropV = (drop / 100) * voltage;
    const requiredArea = (2 * length * current) / (56 * maxDropV);
    const recommended = cableSizes.find(s => s >= requiredArea) ?? null;

    let fuse: string;
    if (current < 50) fuse = "Mini zekeringenset";
    else if (current <= 100) fuse = "100A zekering";
    else fuse = "150A zekering";

    setResult({ current, cable: recommended, fuse });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="text-center py-16">
          <h1 className="font-display text-[56px] leading-none text-foreground mb-4">KABELDIKTE CALCULATOR</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Bereken de juiste kabeldikte voor jouw camper installatie.
          </p>
        </div>

        {/* Main content */}
        <div className="max-w-5xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
            {/* Left — Calculator (3/5) */}
            <div className="md:col-span-3">
              <div className="bg-card border border-border rounded-2xl p-8">
                <div className="space-y-6">
                  {/* Voltage */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground/80 mb-2">Systeemspanning</label>
                    <div className="flex gap-2">
                      {([12, 24] as const).map(v => (
                        <button
                          key={v}
                          onClick={() => setVoltage(v)}
                          className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                            voltage === v
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary border border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {v}V
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input mode */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground/80 mb-2">Invoermodus</label>
                    <div className="flex gap-2">
                      {([["watt", "Watt (W)"], ["ampere", "Ampère (A)"]] as const).map(([mode, label]) => (
                        <button
                          key={mode}
                          onClick={() => setInputMode(mode as "watt" | "ampere")}
                          className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                            inputMode === mode
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary border border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Value input */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground/80 mb-2">
                      {inputMode === "watt" ? "Verbruik (Watt)" : "Stroom (Ampère)"}
                    </label>
                    <input
                      type="number"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      placeholder={inputMode === "watt" ? "600" : "50"}
                      className="w-full bg-[hsl(0_0%_10%)] border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {/* Cable length */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground/80 mb-2">
                      Kabellengte (heenweg, meter)
                    </label>
                    <input
                      type="number"
                      value={cableLength}
                      onChange={e => setCableLength(e.target.value)}
                      placeholder="3.5"
                      className="w-full bg-[hsl(0_0%_10%)] border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <p className="text-xs text-muted-foreground/40 mt-1">
                      Alleen de heenweg — we verdubbelen dit automatisch
                    </p>
                  </div>

                  {/* Max drop */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground/80 mb-2">
                      Max. spanningsverlies (%)
                    </label>
                    <input
                      type="number"
                      value={maxDrop}
                      onChange={e => setMaxDrop(e.target.value)}
                      className="w-full bg-[hsl(0_0%_10%)] border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <p className="text-xs text-muted-foreground/40 mt-1">
                      Standaard 3% — max 5% aanbevolen
                    </p>
                  </div>

                  {/* Calculate button */}
                  <button
                    onClick={calculate}
                    className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground font-bold text-base py-4 rounded-xl hover:brightness-110 transition-all"
                  >
                    <Zap size={18} /> Bereken nu
                  </button>

                  {/* Error */}
                  {error && (
                    <p className="text-destructive/70 text-sm">Vul alle velden correct in.</p>
                  )}

                  {/* Result */}
                  {result && (
                    <div className="border border-primary rounded-xl bg-[hsl(0_0%_7%)] p-6 mt-4 animate-fade-in-up">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-primary text-sm font-semibold">Benodigde stroom:</span>
                          <span className="text-foreground font-bold text-lg">~{result.current.toFixed(1)} A</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-primary text-sm font-semibold">Aanbevolen kabel:</span>
                          {result.cable ? (
                            <Link
                              to="/shop?collection=cables"
                              className="text-primary font-bold text-lg hover:underline"
                            >
                              {result.cable} mm²
                            </Link>
                          ) : (
                            <span className="text-destructive font-bold text-lg">&gt;50 mm² (specialist nodig)</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-primary text-sm font-semibold">Aanbevolen zekering:</span>
                          <Link
                            to="/shop?collection=accessories"
                            className="text-primary font-bold text-lg hover:underline"
                          >
                            {result.fuse}
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right — Info (2/5) */}
            <div className="md:col-span-2">
              <div className="bg-card border border-border rounded-2xl p-8 md:sticky md:top-24">
                <h3 className="text-foreground font-bold text-lg mb-4">💡 Hoe werkt het?</h3>
                <div className="space-y-3">
                  {[
                    "Kies Watt of Ampère als invoer",
                    "Selecteer je systeemspanning (12V of 24V)",
                    "Voer kabellengte in (enkel heenweg)",
                    "Klik Bereken en zie je aanbeveling",
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-muted-foreground/70">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border my-6" />

                <h4 className="text-foreground font-semibold mb-3">Waarom kabeldikte belangrijk is:</h4>
                <div className="space-y-2">
                  {[
                    "Te dunne kabels worden gevaarlijk heet",
                    "Spanningsverlies vermindert prestaties",
                    "Correcte dikte = veiliger & efficiënter",
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground/70">{text}</p>
                    </div>
                  ))}
                </div>

                <Link
                  to="/shop?collection=cables"
                  className="inline-block mt-6 text-sm font-semibold text-primary hover:underline"
                >
                  Bekijk onze kabelcollectie →
                </Link>
              </div>
            </div>
          </div>

          {/* SEO Content */}
          <div className="max-w-3xl mx-auto mt-16 space-y-8">
            <div>
              <h2 className="text-foreground font-bold text-2xl mb-3">Hoe bereken je de juiste kabeldikte?</h2>
              <p className="text-muted-foreground/70 leading-relaxed">
                De juiste kabeldikte is essentieel voor een veilige en efficiënte 12V of 24V installatie in je campervan. 
                Een te dunne kabel leidt tot overmatig spanningsverlies, oververhitting en in het ergste geval brandgevaar. 
                Door het vermogen (Watt) of de stroom (Ampère), de kabellengte en het gewenste maximale spanningsverlies in te voeren, 
                berekent onze tool de minimale doorsnede die je nodig hebt.
              </p>
              <p className="text-muted-foreground/70 leading-relaxed mt-4">
                We gebruiken de standaard kopergeleider-formule met een geleidbaarheid van 56 m/Ω·mm². 
                De kabellengte wordt automatisch verdubbeld om zowel de plus- als de minleiding mee te rekenen. 
                Zo krijg je altijd een betrouwbaar advies, of je nu een kleine koelkast of een zware omvormer aansluit.
              </p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-2xl mb-3">Watt vs. Ampère — wat is het verschil?</h2>
              <p className="text-muted-foreground/70 leading-relaxed">
                Watt (W) is het totale vermogen dat een apparaat verbruikt, terwijl Ampère (A) de stroomsterkte door de kabel aangeeft. 
                De relatie is eenvoudig: <span className="text-foreground font-semibold">Watt = Volt × Ampère</span>. 
                Bij een 12V-systeem trekt een apparaat van 600W dus 50A. Bij 24V is dat slechts 25A — 
                daarom zijn 24V-systemen populair bij hogere vermogens, omdat je dunnere kabels kunt gebruiken.
              </p>
            </div>

            <div>
              <h2 className="text-foreground font-bold text-2xl mb-3">Tips voor jouw installatie</h2>
              <ul className="space-y-2 text-muted-foreground/70 leading-relaxed list-disc list-inside">
                <li>Kies altijd de eerstvolgende standaard kabeldikte boven het berekende minimum — een maat groter is veiliger.</li>
                <li>Houd kabels zo kort mogelijk om spanningsverlies te beperken, en bundel plus- en minkabels samen voor een nette installatie.</li>
                <li>Plaats een zekering zo dicht mogelijk bij de batterij — deze beschermt de kabel, niet het apparaat.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Calculator;
