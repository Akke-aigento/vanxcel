import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConfiguratorWizard from "@/components/configurator/ConfiguratorWizard";
import { useTranslation } from "react-i18next";

const Configurator = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <div className="text-center py-16">
          <h1 className="font-display text-[56px] leading-none text-foreground mb-4">
            {t("configurator.title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {t("configurator.subtitle")}
          </p>
        </div>
        <ConfiguratorWizard />
      </div>
      <Footer />
    </div>
  );
};

export default Configurator;
