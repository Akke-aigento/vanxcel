import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import logoWhite from "@/assets/logo-white.png";
import MagneticButton from "./MagneticButton";

const HeroSection = () => {
  const { t } = useTranslation();
  const [scrollY, setScrollY] = useState(0);
  const [showIndicator, setShowIndicator] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
      setShowIndicator(window.scrollY < 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative h-[85vh] md:h-[90vh] w-full overflow-hidden">
      {/* Ken Burns zoom + parallax */}
      <div
        className="absolute inset-0 ken-burns-zoom"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      >
        <img
          src={heroBg}
          alt="VW T3 campervan silhouette against mountain sunset"
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover object-[center_20%] scale-100"
        />
      </div>

      {/* Floating glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />
        <div className="glow-orb glow-orb-3" />
      </div>

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
          <MagneticButton>
            <Link
              to="/shop"
              className="btn-shimmer px-8 py-3 bg-accent text-accent-foreground font-semibold text-sm rounded hover:brightness-110 transition-all inline-block"
            >
              {t("hero.ctaShop")}
            </Link>
          </MagneticButton>
          <MagneticButton>
            <Link
              to="/calculator?tab=build"
              className="px-8 py-3 border border-foreground/30 text-foreground font-semibold text-sm rounded hover:bg-foreground/10 transition-all inline-block"
            >
              {t("hero.ctaBuild")}
            </Link>
          </MagneticButton>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-10 transition-opacity duration-500 ${
          showIndicator ? "opacity-60" : "opacity-0"
        }`}
      >
        <ChevronDown size={28} className="text-foreground animate-scroll-bounce" />
      </div>
    </section>
  );
};

export default HeroSection;
