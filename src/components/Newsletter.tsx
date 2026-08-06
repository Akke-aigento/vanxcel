import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import RevealOnScroll from "./RevealOnScroll";
import MagneticButton from "./MagneticButton";
import { sellqoFetch } from "@/integrations/sellqo/client";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await sellqoFetch("/newsletter", {
        method: "POST",
        body: JSON.stringify({ email, source: "website" }),
      });
      toast.success(t("newsletter.success"));
      setEmail("");
    } catch {
      toast.error(t("newsletter.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-secondary/50 py-20">
      <div className="container mx-auto px-4 max-w-xl text-center">
        <RevealOnScroll direction="up">
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            {t("newsletter.title")}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t("newsletter.subtitle")}
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("newsletter.placeholder")}
              required
              className="flex-1 px-4 py-3 bg-card border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <MagneticButton>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-accent text-accent-foreground rounded font-semibold text-sm hover:brightness-110 transition-all flex items-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              </button>
            </MagneticButton>
          </form>
        </RevealOnScroll>
      </div>
    </section>
  );
};

export default Newsletter;
