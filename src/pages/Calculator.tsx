import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PowerCalculator from "@/components/PowerCalculator";
import CableCalculator from "@/components/CableCalculator";
import BuildWizard from "@/components/BuildWizard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const tabMap: Record<string, string> = { power: "power", cable: "cable", build: "build" };

const Calculator = () => {
  const { t } = useTranslation();
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
        <div className="text-center py-10 md:py-16">
          <h1 className="font-display text-3xl md:text-[56px] leading-none text-foreground mb-4">{t("toolsHub.title")}</h1>
          <p className="text-sm md:text-lg text-muted-foreground max-w-xl mx-auto px-4">{t("toolsHub.subtitle")}</p>
        </div>

        <div className="max-w-5xl mx-auto px-4">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full flex justify-center bg-secondary/50 border border-border rounded-xl p-1 mb-8 md:mb-12">
              <TabsTrigger value="power" className="flex-1 rounded-lg py-2.5 md:py-3 text-xs md:text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <span className="hidden md:inline">⚡ </span>{t("toolsHub.tabPower")}
              </TabsTrigger>
              <TabsTrigger value="cable" className="flex-1 rounded-lg py-2.5 md:py-3 text-xs md:text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <span className="hidden md:inline">🔌 </span>{t("toolsHub.tabCable")}
              </TabsTrigger>
              <TabsTrigger value="build" className="flex-1 rounded-lg py-2.5 md:py-3 text-xs md:text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <span className="hidden md:inline">🛠️ </span>{t("toolsHub.tabBuild")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="power">
              <PowerCalculator />
            </TabsContent>
            <TabsContent value="cable">
              <CableCalculator />
            </TabsContent>
            <TabsContent value="build">
              <BuildWizard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Calculator;
