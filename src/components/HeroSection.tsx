import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background image */}
      <img
        src={heroBg}
        alt="VW T3 campervan silhouette against mountain sunset"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 hero-gradient-overlay" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-24 px-4 text-center">
        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[96px] tracking-tight text-foreground animate-fade-in-up leading-none">
          Power Your Journey.
        </h1>
        <p className="mt-4 text-lg md:text-xl text-primary font-medium animate-fade-in-up-delay-1">
          LiFePO4 batterijen & off-grid systemen voor campervans
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 animate-fade-in-up-delay-2">
          <Link
            to="/shop"
            className="px-8 py-3 bg-accent text-accent-foreground font-semibold text-sm rounded hover:brightness-110 transition-all"
          >
            Bekijk Kits →
          </Link>
          <Link
            to="/build"
            className="px-8 py-3 border border-foreground/30 text-foreground font-semibold text-sm rounded hover:bg-foreground/10 transition-all"
          >
            Bouw je Systeem
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
