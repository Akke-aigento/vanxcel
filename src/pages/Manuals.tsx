import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getManualDownloadUrl, type ProductManual } from "@/integrations/manuals/api";
import { useDocumentTitle } from "@/hooks/use-document-title";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RevealOnScroll from "@/components/RevealOnScroll";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LANGS = ["nl", "en", "fr", "de"] as const;

const Manuals = () => {
  const { t } = useTranslation();
  useDocumentTitle(t("manuals.title"), {
    description:
      "Download productdocumentatie en installatiehandleidingen voor VanXcel batterijen, omvormers, laders en meer.",
    path: "/manuals",
  });

  const [product, setProduct] = useState("all");
  const [lang, setLang] = useState("all");
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data: manuals = [], isLoading } = useQuery({
    queryKey: ["product-manuals", "published"],
    queryFn: async (): Promise<ProductManual[]> => {
      const { data, error } = await supabase
        .from("product_manuals")
        .select("*")
        .eq("is_published", true)
        .order("product_name", { ascending: true })
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ProductManual[];
    },
  });

  const productOptions = useMemo(
    () => Array.from(new Set(manuals.map((m) => m.product_name))).sort(),
    [manuals],
  );
  const langOptions = useMemo(
    () => LANGS.filter((l) => manuals.some((m) => m.language === l)),
    [manuals],
  );

  const filtered = useMemo(
    () =>
      manuals.filter(
        (m) =>
          (product === "all" || m.product_name === product) &&
          (lang === "all" || m.language === lang),
      ),
    [manuals, product, lang],
  );

  const hasFilters = product !== "all" || lang !== "all";

  const handleDownload = async (m: ProductManual) => {
    const win = window.open("", "_blank");
    setDownloading(m.id);
    try {
      const url = await getManualDownloadUrl(m.storage_path);
      if (win && !win.closed) win.location.href = url;
      else window.location.href = url;
    } catch (e) {
      win?.close();
      toast({
        title: t("manuals.downloadFailed"),
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <RevealOnScroll direction="up">
            <div className="text-center mb-12">
              <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
                {t("manuals.title")}
              </h1>
              <p className="text-muted-foreground text-lg">{t("manuals.subtitle")}</p>
            </div>
          </RevealOnScroll>

          {!isLoading && manuals.length > 0 && (
            <RevealOnScroll direction="up" delay={100}>
              <div className="border border-border rounded-xl p-4 md:p-6 mb-8 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">
                    {t("manuals.filterProduct")}
                  </label>
                  <Select value={product} onValueChange={setProduct}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("manuals.allProducts")}</SelectItem>
                      {productOptions.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-0">
                  <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">
                    {t("manuals.filterLanguage")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setLang("all")}
                      className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                        lang === "all"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t("manuals.allLanguages")}
                    </button>
                    {langOptions.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLang(l)}
                        className={`px-3 py-1.5 rounded-md text-sm border uppercase transition-colors ${
                          lang === l
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {hasFilters && (
                  <Button
                    variant="ghost"
                    className="md:self-end"
                    onClick={() => {
                      setProduct("all");
                      setLang("all");
                    }}
                  >
                    {t("manuals.reset")}
                  </Button>
                )}
              </div>
            </RevealOnScroll>
          )}

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <RevealOnScroll direction="up" delay={150}>
              <div className="border border-border rounded-xl p-8 text-center">
                <FileText className="mx-auto text-muted-foreground mb-3" size={28} />
                <p className="text-muted-foreground">
                  {manuals.length === 0 ? t("manuals.empty") : t("manuals.noResults")}
                </p>
              </div>
            </RevealOnScroll>
          ) : (
            <div className="space-y-4">
              {filtered.map((m, i) => (
                <RevealOnScroll key={m.id} direction="up" delay={Math.min(i * 60, 300)}>
                  <div className="border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="text-primary" size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-lg text-foreground truncate">{m.title}</h2>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-sm text-muted-foreground">{m.product_name}</span>
                        <span className="text-[11px] uppercase tracking-wide px-2 py-0.5 rounded border border-border text-muted-foreground">
                          {m.language}
                        </span>
                      </div>
                    </div>
                    <Button onClick={() => handleDownload(m)} disabled={downloading === m.id}>
                      {downloading === m.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Download size={16} />
                      )}
                      <span className="ml-2">{t("manuals.download")}</span>
                    </Button>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Manuals;
