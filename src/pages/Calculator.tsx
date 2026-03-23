import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Zap } from "lucide-react";

const cableSizes = [2.5, 4, 6, 10, 16, 25, 35, 50];

const Calculator = () => {
  const { t } = useTranslation();
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
    if (current < 50) fuse = t("calcPage.miniSet");
    else if (current <= 100) fuse = t("calcPage.fuse100");
    else fuse = t("calcPage.fuse150");

    setResult({ current, cable: recommended, fuse });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="text-center py-16">
          <h1 className="font-display text-[56px] leading-none text-foreground mb-4">{t("calcPage.title")}</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">{t("calcPage.subtitle")}</p>
        </div>

        <div className="max-w-5xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
            <div className="md:col-span-3">
              <div className="bg-card border border-border rounded-2xl p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground/80 mb-2">{t("calcPage.systemVoltage")}</label>
                    <div className="flex gap-2">
                      {([12, 24] as const).map(v => (
                        <button key={v} onClick={() => setVoltage(v)}
                          className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${voltage === v ? "bg-primary text-primary-foreground" : "bg-secondary border border-border text-muted-foreground hover:text-foreground"}`}>
                          {v}V
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground/80 mb-2">{t("calcPage.inputMode")}</label>
                    <div className="flex gap-2">
                      {([["watt", t("calcPage.watt")], ["ampere", t("calcPage.ampere")]] as const).map(([mode, label]) => (
                        <button key={mode} onClick={() => setInputMode(mode as "watt" | "ampere")}
                          className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${inputMode === mode ? "bg-primary text-primary-foreground" : "bg-secondary border border-border text-muted-foreground hover:text-foreground"}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground/80 mb-2">
                      {inputMode === "watt" ? t("calcPage.consumptionW") : t("calcPage.currentA")}
                    </label>
                    <input type="number" value={inputValue} onChange={e => setInputValue(e.target.value)}
                      placeholder={inputMode === "watt" ? "600" : "50"}
                      className="w-full bg-[hsl(0_0%_10%)] border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground/80 mb-2">{t("calcPage.cableLength")}</label>
                    <input type="number" value={cableLength} onChange={e => setCableLength(e.target.value)} placeholder="3.5"
                      className="w-full bg-[hsl(0_0%_10%)] border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring" />
                    <p className="text-xs text-muted-foreground/40 mt-1">{t("calcPage.cableLengthHint")}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground/80 mb-2">{t("calcPage.maxDrop")}</label>
                    <input type="number" value={maxDrop} onChange={e => setMaxDrop(e.target.value)}
                      className="w-full bg-[hsl(0_0%_10%)] border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring" />
                    <p className="text-xs text-muted-foreground/40 mt-1">{t("calcPage.maxDropHint")}</p>
                  </div>

                  <button onClick={calculate}
                    className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground font-bold text-base py-4 rounded-xl hover:brightness-110 transition-all">
                    <Zap size={18} /> {t("calcPage.calculate")}
                  </button>

                  {error && <p className="text-destructive/70 text-sm">{t("calcPage.fillFields")}</p>}

                  {result && (
                    <div className="border border-primary rounded-xl bg-[hsl(0_0%_7%)] p-6 mt-4 animate-fade-in-up">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-primary text-sm font-semibold">{t("calcPage.requiredCurrent")}</span>
                          <span className="text-foreground font-bold text-lg">~{result.current.toFixed(1)} A</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-primary text-sm font-semibold">{t("calcPage.recommendedCable")}</span>
                          {result.cable ? (
                            <Link to="/shop?collection=cables" className="text-primary font-bold text-lg hover:underline">
                              {result.cable} mm²
                            </Link>
                          ) : (
                            <span className="text-destructive font-bold text-lg">{t("calcPage.specialistNeeded")}</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-primary text-sm font-semibold">{t("calcPage.recommendedFuse")}</span>
                          <Link to="/shop?collection=accessories" className="text-primary font-bold text-lg hover:underline">
                            {result.fuse}
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="bg-card border border-border rounded-2xl p-8 md:sticky md:top-24">
                <h3 className="text-foreground font-bold text-lg mb-4">{t("calcPage.howItWorks")}</h3>
                <div className="space-y-3">
                  {[t("calcPage.step1"), t("calcPage.step2"), t("calcPage.step3"), t("calcPage.step4")].map((text, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                      <p className="text-sm text-muted-foreground/70">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border my-6" />

                <h4 className="text-foreground font-semibold mb-3">{t("calcPage.whyImportant")}</h4>
                <div className="space-y-2">
                  {[t("calcPage.reason1"), t("calcPage.reason2"), t("calcPage.reason3")].map((text, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground/70">{text}</p>
                    </div>
                  ))}
                </div>

                <Link to="/shop?collection=cables" className="inline-block mt-6 text-sm font-semibold text-primary hover:underline">
                  {t("calcPage.viewCables")}
                </Link>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-16 space-y-8">
            <div>
              <h2 className="text-foreground font-bold text-2xl mb-3">{t("calcPage.seoTitle1")}</h2>
              <p className="text-muted-foreground/70 leading-relaxed">{t("calcPage.seoText1")}</p>
              <p className="text-muted-foreground/70 leading-relaxed mt-4">{t("calcPage.seoText1b")}</p>
            </div>
            <div>
              <h2 className="text-foreground font-bold text-2xl mb-3">{t("calcPage.seoTitle2")}</h2>
              <p className="text-muted-foreground/70 leading-relaxed">{t("calcPage.seoText2")}</p>
            </div>
            <div>
              <h2 className="text-foreground font-bold text-2xl mb-3">{t("calcPage.seoTitle3")}</h2>
              <ul className="space-y-2 text-muted-foreground/70 leading-relaxed list-disc list-inside">
                <li>{t("calcPage.tip1")}</li>
                <li>{t("calcPage.tip2")}</li>
                <li>{t("calcPage.tip3")}</li>
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
