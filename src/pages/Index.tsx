import { useDocumentTitle } from "@/hooks/use-document-title";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustBar from "@/components/TrustBar";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import PowerCalculator from "@/components/PowerCalculator";
import ReviewsMarquee from "@/components/ReviewsMarquee";
import ComparisonTable from "@/components/ComparisonTable";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

const Index = () => {
  useDocumentTitle(undefined, {
    description:
      "VanXcel — Belgisch merk voor LiFePO4 batterijen, omvormers en complete off-grid energiesystemen voor campervans. 2 jaar garantie, eigen support.",
    path: "/",
  });
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <TrustBar />
      <CategoryGrid />
      <FeaturedProducts />
      <PowerCalculator />
      <ReviewsMarquee />
      <ComparisonTable />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Index;
