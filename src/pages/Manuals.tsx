import { useTranslation } from "react-i18next";
import { FileText, Mail, Download } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RevealOnScroll from "@/components/RevealOnScroll";
import { Button } from "@/components/ui/button";

const Manuals = () => {
  const { t } = useTranslation();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <RevealOnScroll direction="up">
            <div className="text-center mb-16">
              <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
                {t("manuals.title")}
              </h1>
              <p className="text-muted-foreground text-lg">
                {t("manuals.subtitle")}
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={100}>
            <div className="border border-border rounded-xl p-8 mb-8">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="text-primary" size={24} />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-foreground mb-3">
                    {t("manuals.schemasTitle")}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {t("manuals.schemasDesc")}
                  </p>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={200}>
            <div className="border border-border rounded-xl p-8 mb-8">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Mail className="text-accent" size={24} />
                </div>
                <div>
                  <h2 className="font-display text-xl text-foreground mb-3">
                    {t("manuals.howTitle")}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    {t("manuals.howDesc")}
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                    <li>{t("manuals.step1")}</li>
                    <li>{t("manuals.step2")}</li>
                    <li>{t("manuals.step3")}</li>
                  </ul>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={300}>
            <div className="border border-border rounded-xl p-8 mb-8">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Download className="text-primary" size={24} />
                </div>
                <div>
                  <h2 className="font-display text-xl text-foreground mb-3">
                    {t("manuals.needHelp")}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {t("manuals.needHelpDesc")}
                  </p>
                  <Button asChild>
                    <Link to="/contact">{t("manuals.contactUs")}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Manuals;
