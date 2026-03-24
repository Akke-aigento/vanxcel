import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Zap, Shield, Heart, Compass, Package, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RevealOnScroll from "@/components/RevealOnScroll";
import SplitRevealText from "@/components/SplitRevealText";
import { Button } from "@/components/ui/button";

const About = () => {
  const { t } = useTranslation();

  const visionCards = [
    { icon: Package, titleKey: "about.visionComplete", descKey: "about.visionCompleteDesc" },
    { icon: Compass, titleKey: "about.visionGuide", descKey: "about.visionGuideDesc" },
    { icon: Shield, titleKey: "about.visionProven", descKey: "about.visionProvenDesc" },
  ];

  const uspCards = [
    { icon: Heart, titleKey: "about.uspPassion", descKey: "about.uspPassionDesc" },
    { icon: Zap, titleKey: "about.uspEase", descKey: "about.uspEaseDesc" },
    { icon: Users, titleKey: "about.uspCommunity", descKey: "about.uspCommunityDesc" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <RevealOnScroll>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-4">
              {t("about.heroTitle")}
            </h1>
          </RevealOnScroll>
          <RevealOnScroll delay={200}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("about.heroSubtitle")}
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <RevealOnScroll>
            <div className="text-center mb-12">
              <SplitRevealText
                text={t("about.introTitle")}
                className="text-2xl md:text-4xl font-bold text-foreground mb-6"
              />
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={100}>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg mb-4">
              {t("about.introText1")}
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={200}>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
              {t("about.introText2")}
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Ons Verhaal */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <RevealOnScroll>
            <div className="text-center mb-12">
              <SplitRevealText
                text={t("about.storyTitle")}
                className="text-2xl md:text-4xl font-bold text-foreground"
              />
            </div>
          </RevealOnScroll>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
            <RevealOnScroll direction="left" delay={100}>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {t("about.storyText1")}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {t("about.storyText2")}
                </p>
              </div>
            </RevealOnScroll>
            <RevealOnScroll direction="right" delay={200}>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {t("about.storyText3")}
                </p>
                <p className="text-muted-foreground leading-relaxed font-medium text-foreground">
                  {t("about.storyText4")}
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Onze Visie */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <RevealOnScroll>
            <div className="text-center mb-12">
              <SplitRevealText
                text={t("about.visionTitle")}
                className="text-2xl md:text-4xl font-bold text-foreground"
              />
              <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
                {t("about.visionSubtitle")}
              </p>
            </div>
          </RevealOnScroll>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {visionCards.map((card, i) => (
              <RevealOnScroll key={card.titleKey} delay={i * 120}>
                <div className="group p-6 rounded-xl border border-border bg-card hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 text-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <card.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t(card.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(card.descKey)}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Waarom VanXcel */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <RevealOnScroll>
            <div className="text-center mb-12">
              <SplitRevealText
                text={t("about.whyTitle")}
                className="text-2xl md:text-4xl font-bold text-foreground"
              />
            </div>
          </RevealOnScroll>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {uspCards.map((card, i) => (
              <RevealOnScroll key={card.titleKey} delay={i * 120}>
                <div className="group p-6 rounded-xl border border-border bg-card hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 text-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <card.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t(card.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(card.descKey)}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <RevealOnScroll>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              {t("about.ctaTitle")}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              {t("about.ctaSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="cta-shimmer bg-accent text-accent-foreground hover:bg-accent/90 font-bold">
                <Link to="/shop">{t("about.ctaShop")}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">{t("about.ctaContact")}</Link>
              </Button>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
