import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sellqoFetch } from "@/integrations/sellqo/client";

const STORAGE_KEY = "vanxcel_cookie_consent";

type LegalPage = { title: string; url: string; slug: string };

const readConsent = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const CookieConsent = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [cookieSlug, setCookieSlug] = useState<string>("cookie");

  useEffect(() => {
    if (readConsent()) return;
    setVisible(true);

    sellqoFetch<{ data: LegalPage[] }>("/legal")
      .then((r) => {
        const pages = r?.data || [];
        const match = pages.find((p) =>
          `${p.slug || ""} ${p.title || ""}`.toLowerCase().includes("cookie")
        );
        if (match?.slug) setCookieSlug(match.slug);
      })
      .catch(() => {});
  }, []);

  if (!visible) return null;

  const decide = (choice: "accepted" | "rejected") => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ choice, timestamp: new Date().toISOString() })
      );
    } catch {
      /* fail-safe: banner sluit toch */
    }
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[80] p-3 sm:p-4 motion-safe:animate-fade-in-up">
      <div className="container mx-auto max-w-4xl bg-card border border-border rounded-lg shadow-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <Cookie size={20} className="shrink-0 text-primary hidden sm:block" />
        <p className="text-sm text-muted-foreground leading-snug flex-1">
          {t("cookie.text")}{" "}
          {cookieSlug && (
            <Link
              to={`/legal/${cookieSlug}`}
              className="text-primary underline underline-offset-2 hover:text-primary/80"
            >
              {t("cookie.moreInfo")}
            </Link>
          )}
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => decide("rejected")}>
            {t("cookie.reject")}
          </Button>
          <Button size="sm" onClick={() => decide("accepted")}>
            {t("cookie.accept")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
