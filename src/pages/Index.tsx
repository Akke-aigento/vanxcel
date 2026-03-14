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
