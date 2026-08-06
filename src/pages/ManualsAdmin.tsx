import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2, Upload } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomerAuth } from "@/integrations/sellqo/CustomerAuthContext";
import { useProducts } from "@/integrations/sellqo/hooks";
import { extractArray } from "@/integrations/sellqo/client";
import { manualsFetch, type ProductManual } from "@/integrations/manuals/api";
import { useDocumentTitle } from "@/hooks/use-document-title";

const LANGS = ["nl", "en", "fr", "de"] as const;

interface RawProduct { sku?: string; name?: string; id?: string }

const ManualsAdmin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, isAuthenticated, loading } = useCustomerAuth();
  useDocumentTitle(t("manualsAdmin.title"), { path: "/beheer/handleidingen" });

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/login");
  }, [loading, isAuthenticated, navigate]);

  const { data: productsData } = useProducts();
  const products = useMemo(() => {
    const raw = extractArray<RawProduct>(productsData);
    return raw
      .map((p) => ({ sku: p.sku || p.id || "", name: p.name || "" }))
      .filter((p) => p.sku && p.name);
  }, [productsData]);

  const {
    data: manuals = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product-manuals", "admin"],
    enabled: !!token,
    retry: false,
    queryFn: () => manualsFetch<ProductManual[]>({ action: "list" }, token),
  });

  const forbidden = (error as (Error & { status?: number }) | null)?.status === 403;

  const [sku, setSku] = useState("");
  const [language, setLanguage] = useState<string>("nl");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["product-manuals"] });

  const handleUpload = async () => {
    const product = products.find((p) => p.sku === sku);
    if (!product || !title || !file) {
      toast({ title: t("manualsAdmin.missingFields"), variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const { url, storage_path } = await manualsFetch<{ url: string; storage_path: string }>(
        { action: "get_upload_url" },
        token,
      );
      const put = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/pdf" },
        body: file,
      });
      if (!put.ok) throw new Error(`Upload failed (${put.status})`);

      await manualsFetch(
        {
          action: "create",
          product_sku: product.sku,
          product_name: product.name,
          language,
          title,
          storage_path,
          file_size: file.size,
          is_published: false,
        },
        token,
      );
      setTitle("");
      setFile(null);
      toast({ title: t("manualsAdmin.uploaded") });
      refresh();
    } catch (e) {
      toast({ title: (e as Error).message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const patch = async (id: string, data: Record<string, unknown>) => {
    try {
      await manualsFetch({ action: "update", id, ...data }, token);
      refresh();
    } catch (e) {
      toast({ title: (e as Error).message, variant: "destructive" });
    }
  };

  const remove = async (id: string) => {
    try {
      await manualsFetch({ action: "delete", id }, token);
      toast({ title: t("manualsAdmin.deleted") });
      refresh();
    } catch (e) {
      toast({ title: (e as Error).message, variant: "destructive" });
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-8">
            {t("manualsAdmin.title")}
          </h1>

          {forbidden ? (
            <div className="border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground">{t("manualsAdmin.noAccess")}</p>
            </div>
          ) : (
            <>
              <section className="border border-border rounded-xl p-5 md:p-6 mb-10 space-y-4">
                <h2 className="font-display text-xl text-foreground">
                  {t("manualsAdmin.newManual")}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">
                      {t("manualsAdmin.product")}
                    </label>
                    <Select value={sku} onValueChange={setSku}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("manualsAdmin.selectProduct")} />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.sku} value={p.sku}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">
                      {t("manualsAdmin.language")}
                    </label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGS.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">
                      {t("manualsAdmin.manualTitle")}
                    </label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">
                      {t("manualsAdmin.pdfFile")}
                    </label>
                    <Input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                </div>
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                  <span className="ml-2">{t("manualsAdmin.upload")}</span>
                </Button>
              </section>

              <h2 className="font-display text-xl text-foreground mb-4">
                {t("manualsAdmin.allManuals")}
              </h2>
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-muted-foreground" />
                </div>
              ) : manuals.length === 0 ? (
                <p className="text-muted-foreground">{t("manualsAdmin.empty")}</p>
              ) : (
                <div className="space-y-3">
                  {manuals.map((m) => (
                    <div
                      key={m.id}
                      className="border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3"
                    >
                      <div className="flex-1 min-w-0 space-y-2">
                        <Input
                          defaultValue={m.title}
                          onBlur={(e) =>
                            e.target.value !== m.title && patch(m.id, { title: e.target.value })
                          }
                        />
                        <div className="text-sm text-muted-foreground truncate">
                          {m.product_name} · {m.product_sku}
                        </div>
                      </div>
                      <Select value={m.language} onValueChange={(v) => patch(m.id, { language: v })}>
                        <SelectTrigger className="w-full md:w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGS.map((l) => (
                            <SelectItem key={l} value={l}>
                              {l.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {t("manualsAdmin.order")}
                        </span>
                        <Input
                          type="number"
                          className="w-20"
                          defaultValue={m.sort_order}
                          onBlur={(e) =>
                            Number(e.target.value) !== m.sort_order &&
                            patch(m.id, { sort_order: Number(e.target.value) })
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={m.is_published}
                          onCheckedChange={(v) => patch(m.id, { is_published: v })}
                        />
                        <span className="text-xs text-muted-foreground">
                          {m.is_published
                            ? t("manualsAdmin.published")
                            : t("manualsAdmin.draft")}
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => remove(m.id)}>
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ManualsAdmin;
