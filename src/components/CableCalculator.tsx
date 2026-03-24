import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, Zap, ShoppingBag, ArrowRight } from "lucide-react";
import { useProducts } from "@/integrations/sellqo/hooks";
import type { Product } from "@/integrations/sellqo/types";

const cableSizes = [2.5, 4, 6, 10, 16, 25, 35, 50];

function matchCableProduct(products: Product[] | undefined, cableMm: number): Product | null {
  if (!products?.length) return null;
  const searchTerms = [`${cableMm}mm`, `${cableMm} mm`, `${cableMm}mm²`, `${cableMm} mm²`];
  return products.find(p => {
    const title = p.title.toLowerCase();
    const variantMatch = p.variants?.some(v => searchTerms.some(t => v.title.toLowerCase().includes(t)));
    return searchTerms.some(t => title.includes(t)) || variantMatch;
  }) ?? null;
}

function matchFuseProduct(products: Product[] | undefined, fuseKey: string): Product | null {
  if (!products?.length) return null;
  if (fuseKey === 'mini') {
    return products.find(p => {
      const title = p.title.toLowerCase();
      return title.includes('mini') && (title.includes('zekering') || title.includes('fuse'));
    }) ?? null;
  }
  const ampMatch = fuseKey.replace('A', '');
  return products.find(p => {
    const title = p.title.toLowerCase();
    return title.includes(ampMatch) && (title.includes('zekering') || title.includes('fuse'));
  }) ?? null;
}

const RecommendationCard = ({ product, label }: { product: Product; label: string }) => {
  const { t } = useTranslation();
  const mainImage = product.images?.[0]?.url;
  const price = product.price;
  const currency = product.currency || 'EUR';

  const formattedPrice = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency,
  }).format(price);

  return (
    <Link
      to={`/shop/${product.slug}`}
      className="group flex items-center gap-4 bg-secondary/50 border border-border rounded-xl p-4 hover:border-primary/50 transition-all duration-300"
    >
      {mainImage && (
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          <img src={mainImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">{label}</p>
        <p className="text-sm font-bold text-foreground truncate">{product.title}</p>
        <p className="text-primary font-bold text-base mt-1">{formattedPrice}</p>
      </div>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
        <ArrowRight size={14} />
      </div>
    </Link>
  );
};

const CableCalculator = () => {
  const { t } = useTranslation();
  const [voltage, setVoltage] = useState<12 | 24>(12);
  const [inputMode, setInputMode] = useState<"watt" | "ampere">("watt");
  const [inputValue, setInputValue] = useState("");
  const [cableLength, setCableLength] = useState("");
  const [maxDrop, setMaxDrop] = useState("3");
  const [result, setResult] = useState<null | { current: number; cable: number | null; fuse: string; fuseKey: string }>(null);
  const [error, setError] = useState(false);

  const { data: cablesData } = useProducts({ category: 'kabels', per_page: 50 });
  const { data: accessoiresData } = useProducts({ category: 'accessoires', per_page: 50 });

  const cableProducts = useMemo(() => {
    if (!cablesData) return undefined;
    const raw = cablesData as any;
    return raw?.data?.products || raw?.products || (Array.isArray(raw) ? raw : undefined);
  }, [cablesData]);

  const accessoireProducts = useMemo(() => {
    if (!accessoiresData) return undefined;
    const raw = accessoiresData as any;
    return raw?.data?.products || raw?.products || (Array.isArray(raw) ? raw : undefined);
  }, [accessoiresData]);

  const matchedCable = useMemo(() => {
    if (!result?.cable) return null;
    return matchCableProduct(cableProducts, result.cable);
  }, [result?.cable, cableProducts]);

  const matchedFuse = useMemo(() => {
    if (!result) return null;
    return matchFuseProduct(accessoireProducts, result.fuseKey);
  }, [result?.fuseKey, accessoireProducts]);

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
    let fuseKey: string;
    if (current < 50) { fuse = t("calcPage.miniSet"); fuseKey = "mini"; }
    else if (current <= 100) { fuse = t("calcPage.fuse100"); fuseKey = "100A"; }
    else { fuse = t("calcPage.fuse150"); fuseKey = "150A"; }

    setResult({ current, cable: recommended, fuse, fuseKey });
  };

  return (
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
                        <Link to="/shop?category=kabels" className="text-primary font-bold text-lg hover:underline">
                          {result.cable} mm²
                        </Link>
                      ) : (
                        <span className="text-destructive font-bold text-lg">{t("calcPage.specialistNeeded")}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-primary text-sm font-semibold">{t("calcPage.recommendedFuse")}</span>
                      <Link to="/shop?category=accessoires" className="text-primary font-bold text-lg hover:underline">
                        {result.fuse}
                      </Link>
                    </div>
                  </div>

                  {/* Dynamic product recommendations */}
                  {(matchedCable || matchedFuse) && (
                    <div className="mt-6 pt-5 border-t border-border/50">
                      <div className="flex items-center gap-2 mb-4">
                        <ShoppingBag size={16} className="text-primary" />
                        <h4 className="text-sm font-bold text-foreground">{t("calcPage.recommendedProducts")}</h4>
                      </div>
                      <div className="space-y-3">
                        {matchedCable && (
                          <RecommendationCard product={matchedCable} label={t("calcPage.matchingCable")} />
                        )}
                        {matchedFuse && (
                          <RecommendationCard product={matchedFuse} label={t("calcPage.matchingFuse")} />
                        )}
                      </div>
                    </div>
                  )}
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

            <Link to="/shop?category=kabels" className="inline-block mt-6 text-sm font-semibold text-primary hover:underline">
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
  );
};

export default CableCalculator;
