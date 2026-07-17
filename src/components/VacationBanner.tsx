import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Plane } from "lucide-react";

const STORAGE_KEY = "vanxcel_vacation_banner_dismissed_v1";
const RESUME_DATE = new Date("2026-08-03T00:00:00");

const messages: Record<string, string> = {
  nl: "We zijn even met vakantie — bestellingen worden opnieuw verstuurd vanaf 03/08/2026. Bedankt voor je geduld!",
  en: "We're on holiday — orders will ship again from 03/08/2026. Thanks for your patience!",
  fr: "Nous sommes en vacances — les commandes seront à nouveau expédiées à partir du 03/08/2026. Merci de votre patience !",
  de: "Wir sind im Urlaub — Bestellungen werden ab dem 03.08.2026 wieder versandt. Danke für Ihre Geduld!",
};

const VacationBanner = () => {
  const { i18n } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (new Date() >= RESUME_DATE) return;
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1") return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  const lang = (i18n.language || "nl").slice(0, 2);
  const text = messages[lang] || messages.nl;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  return (
    <div className="relative z-[60] bg-accent text-accent-foreground">
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-medium text-center">
        <Plane size={16} className="shrink-0 hidden sm:inline-block" />
        <span className="leading-snug">{text}</span>
        <button
          onClick={dismiss}
          aria-label="Sluiten"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-black/10 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default VacationBanner;
