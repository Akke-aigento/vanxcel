import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { sellqoFetch } from "@/integrations/sellqo/client";
import { useDocumentTitle } from "@/hooks/use-document-title";

interface LegalDoc {
  slug: string;
  title: string;
  content: string;
}

const LegalPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const [doc, setDoc] = useState<LegalDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setDoc(null);

    sellqoFetch<{ data: LegalDoc | LegalDoc[] }>(`/legal/${slug}`)
      .then((r) => {
        if (cancelled) return;
        const raw = r?.data;
        const page = Array.isArray(raw) ? raw[0] ?? null : raw ?? null;
        setDoc(page && page.content ? page : null);
      })
      .catch(() => {
        if (!cancelled) setDoc(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useDocumentTitle(doc?.title || t("legal.fallbackTitle"), {
    path: `/legal/${slug}`,
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : doc ? (
            <article>
              <h1 className="font-display text-4xl md:text-5xl text-foreground mb-10">
                {doc.title}
              </h1>
              <div
                className="legal-content"
                dangerouslySetInnerHTML={{ __html: doc.content }}
              />
            </article>
          ) : (
            <div className="text-center py-24">
              <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                {t("legal.fallbackTitle")}
              </h1>
              <p className="text-muted-foreground mb-8">
                {t("legal.fallbackText")}
              </p>
              <Link
                to="/"
                className="text-primary underline underline-offset-4 hover:no-underline"
              >
                {t("legal.backHome")}
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default LegalPage;
