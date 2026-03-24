import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import heroBg from "@/assets/hero-bg.jpg";
import logoWhite from "@/assets/logo-white.png";

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative h-[100vh] md:h-[90vh] w-full overflow-hidden">
      <img
        src={heroBg}
        alt="VW T3 campervan silhouette against mountain sunset"
        className="absolute inset-0 w-full h-full object-cover object-[center_20%]"
      />
      <div className="absolute inset-0 hero-gradient-overlay" />
      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-24 px-4 text-center">
        <img
          src={logoWhite}
          alt="VanXcel logo"
          className="w-[180px] md:w-[240px] mb-6 animate-fade-in-up"
        />
        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[96px] tracking-tight text-foreground animate-fade-in-up leading-none">
          {t("hero.title")}
        </h1>
        <p className="mt-4 text-lg md:text-xl text-primary font-medium animate-fade-in-up-delay-1">
          {t("hero.subtitle")}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 animate-fade-in-up-delay-2">
          <Link
            to="/shop"
            className="px-8 py-3 bg-accent text-accent-foreground font-semibold text-sm rounded hover:brightness-110 transition-all"
          >
            {t("hero.ctaShop")}
          </Link>
          <Link
            to="/calculator?tab=build"
            className="px-8 py-3 border border-foreground/30 text-foreground font-semibold text-sm rounded hover:bg-foreground/10 transition-all"
          >
            {t("hero.ctaBuild")}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
