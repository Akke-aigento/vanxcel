import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "@/hooks/use-document-title";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PowerCalculator from "@/components/PowerCalculator";
import CableCalculator from "@/components/CableCalculator";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const tabMap: Record<string, string> = { power: "power", cable: "cable" };

const Calculator = () => {
  const { t } = useTranslation();
  useDocumentTitle(t("toolsHub.title"), {
    description:
      "Bereken het benodigde vermogen, batterijcapaciteit en kabel-dimensionering voor je campervan met de gratis VanXcel power calculator.",
    path: "/calculator",
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "power";
  const activeTab = tabMap[tabParam] || "power";

  const handleTabChange = (value: string) => {
    setSearchParams(value === "power" ? {} : { tab: value }, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <div className="text-center py-8 md:py-16 px-4">
          <h1 className="font-display text-3xl md:text-[56px] leading-none text-foreground mb-3 md:mb-4">{t("toolsHub.title")}</h1>
          <p className="text-sm md:text-lg text-muted-foreground max-w-xl mx-auto">{t("toolsHub.subtitle")}</p>
        </div>

        <div className="max-w-5xl mx-auto px-4">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full grid grid-cols-2 md:flex md:justify-center gap-1 h-auto bg-secondary/50 border border-border rounded-xl p-1 mb-6 md:mb-12">
              <TabsTrigger value="power" className="md:flex-1 rounded-lg py-2.5 md:py-3 text-xs md:text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <span className="mr-1 md:mr-0 md:hidden">⚡</span><span className="hidden md:inline">⚡ </span>{t("toolsHub.tabPower")}
              </TabsTrigger>
              <TabsTrigger value="cable" className="md:flex-1 rounded-lg py-2.5 md:py-3 text-xs md:text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <span className="mr-1 md:mr-0 md:hidden">🔌</span><span className="hidden md:inline">🔌 </span>{t("toolsHub.tabCable")}
              </TabsTrigger>
              <TabsTrigger value="build" disabled className="md:flex-1 rounded-lg py-2.5 md:py-3 text-xs md:text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground opacity-60">
                <span className="mr-1 md:mr-0 md:hidden">🛠️</span><span className="hidden md:inline">🛠️ </span>{t("toolsHub.tabBuild")}
                <span className="ml-1.5 md:ml-2 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-accent text-accent-foreground">Soon</span>
              </TabsTrigger>
              <TabsTrigger value="configurator" disabled className="md:flex-1 rounded-lg py-2.5 md:py-3 text-xs md:text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground opacity-60">
                <span className="mr-1 md:mr-0 md:hidden">🚐</span><span className="hidden md:inline">🚐 </span>{t("configurator.navLabel")}
                <span className="ml-1.5 md:ml-2 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-accent text-accent-foreground">Soon</span>
              </TabsTrigger>
            </TabsList>


            <TabsContent value="power">
              <PowerCalculator />
            </TabsContent>
            <TabsContent value="cable">
              <CableCalculator />
            </TabsContent>
            <TabsContent value="build">
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🛠️</div>
                <h2 className="font-display text-2xl md:text-3xl text-foreground mb-3">{t("toolsHub.tabBuild")}</h2>
                <p className="text-muted-foreground">{t("nav.comingSoon", "Coming soon!")}</p>
              </div>
            </TabsContent>
            <TabsContent value="configurator">
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🚐</div>
                <h2 className="font-display text-2xl md:text-3xl text-foreground mb-3">{t("configurator.navLabel")}</h2>
                <p className="text-muted-foreground">{t("nav.comingSoon", "Coming soon!")}</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Calculator;
