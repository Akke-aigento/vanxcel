import Navbar from "@/components/Navbar";
import { useDocumentTitle } from "@/hooks/use-document-title";
import Footer from "@/components/Footer";
import ConfiguratorWizard from "@/components/configurator/ConfiguratorWizard";
import { useTranslation } from "react-i18next";

const Configurator = () => {
  const { t } = useTranslation();
  useDocumentTitle(t("configurator.title"), {
    description:
      "Kies merk, model en bouwjaar van je campervan en vind stap voor stap het energiesysteem dat erbij past.",
    path: "/configurator",
  });

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
