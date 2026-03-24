import { useTranslation } from "react-i18next";
import { Truck, Package, Leaf, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RevealOnScroll from "@/components/RevealOnScroll";

const Delivery = () => {
  const { t } = useTranslation();

  const steps = [
    { icon: Package, title: t("delivery.step1Title"), desc: t("delivery.step1Desc") },
    { icon: Clock, title: t("delivery.step2Title"), desc: t("delivery.step2Desc") },
    { icon: Truck, title: t("delivery.step3Title"), desc: t("delivery.step3Desc") },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <RevealOnScroll direction="up">
            <div className="text-center mb-16">
              <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
                {t("delivery.title")}
              </h1>
              <p className="text-muted-foreground text-lg">
                {t("delivery.subtitle")}
              </p>
            </div>
          </RevealOnScroll>

          {/* Shipping rates */}
          <RevealOnScroll direction="up" delay={100}>
            <div className="border border-border rounded-xl p-8 mb-10">
              <h2 className="font-display text-2xl text-foreground mb-6">
                {t("delivery.ratesTitle")}
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-foreground font-medium">🇧🇪 {t("delivery.belgium")}</span>
                  <span className="text-primary font-semibold">{t("delivery.belgiumRate")}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-foreground font-medium">🇳🇱 {t("delivery.netherlands")}</span>
                  <span className="text-primary font-semibold">{t("delivery.netherlandsRate")}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-foreground font-medium">🇪🇺 {t("delivery.eu")}</span>
                  <span className="text-muted-foreground">{t("delivery.euRate")}</span>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Premium delivery */}
          <RevealOnScroll direction="up" delay={200}>
            <div className="border border-primary/30 rounded-xl p-8 mb-10 bg-primary/5">
              <h2 className="font-display text-2xl text-foreground mb-3">
                {t("delivery.premiumTitle")}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("delivery.premiumDesc")}
              </p>
              <p className="text-muted-foreground/70 text-sm">
                {t("delivery.premiumNote")}
              </p>
            </div>
          </RevealOnScroll>

          {/* How it works */}
          <RevealOnScroll direction="up" delay={300}>
            <h2 className="font-display text-2xl text-foreground mb-8 text-center">
              {t("delivery.howTitle")}
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {steps.map((step, i) => (
                <div key={i} className="text-center border border-border rounded-xl p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </RevealOnScroll>

          {/* Sustainability */}
          <RevealOnScroll direction="up" delay={400}>
            <div className="border border-border rounded-xl p-8 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-1">
                <Leaf className="text-green-500" size={20} />
              </div>
              <div>
                <h2 className="font-display text-xl text-foreground mb-2">
                  {t("delivery.sustainTitle")}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t("delivery.sustainDesc")}
                </p>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Delivery;
