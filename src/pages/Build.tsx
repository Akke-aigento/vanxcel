import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BuildWizard from "@/components/BuildWizard";
import { useTranslation } from "react-i18next";

const Build = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="text-center py-16">
          <h1 className="font-display text-[56px] leading-none text-foreground mb-4">{t("build.title")}</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">{t("build.subtitle")}</p>
        </div>
        <BuildWizard />
      </div>
      <Footer />
    </div>
  );
};

export default Build;
