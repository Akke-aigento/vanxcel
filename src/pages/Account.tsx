import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useCustomerAuth } from "@/integrations/sellqo/CustomerAuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, User, MapPin, ShoppingBag, Lock, LogOut, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileTab from "@/components/account/ProfileTab";
import AddressesTab from "@/components/account/AddressesTab";
import OrdersTab from "@/components/account/OrdersTab";
import PasswordTab from "@/components/account/PasswordTab";

const tabs = [
  { id: "profile", icon: User, labelKey: "account.profile" },
  { id: "addresses", icon: MapPin, labelKey: "account.addresses" },
  { id: "orders", icon: ShoppingBag, labelKey: "account.orders" },
  { id: "password", icon: Lock, labelKey: "account.password" },
] as const;

type TabId = typeof tabs[number]["id"];

const Account = () => {
  const { t } = useTranslation();
  useDocumentTitle(t("account.title"));
  const navigate = useNavigate();
  const { isAuthenticated, loading, customer, logout } = useCustomerAuth();
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/login", { state: { from: "/account" }, replace: true });
  }, [loading, isAuthenticated, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="animate-spin text-muted-foreground" size={32} />
    </div>
  );

  if (!isAuthenticated) return null;

  const handleLogout = () => { logout(); navigate("/"); };

  const initials = `${customer?.first_name?.[0] || ""}${customer?.last_name?.[0] || ""}`.toUpperCase();
  const isOwner = customer?.email?.toLowerCase() === "info@vanxcel.com";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        {/* Hero header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-background" />
          <div className="relative container mx-auto px-4 py-12 lg:py-16">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="font-display text-2xl lg:text-3xl text-primary">{initials}</span>
              </div>
              <div>
                <h1 className="font-display text-3xl lg:text-4xl text-foreground">{t("account.title")}</h1>
                <p className="text-muted-foreground mt-1">{t("account.welcome", { name: customer?.first_name })}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16">
          <div className="flex flex-col lg:flex-row gap-8 -mt-2">
            {/* Sidebar nav */}
            <nav className="lg:w-56 shrink-0">
              {/* Desktop sidebar */}
              <div className="hidden lg:flex flex-col gap-1 sticky top-24">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                        active
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <Icon size={16} />
                      {t(tab.labelKey)}
                    </button>
                  );
                })}
                {isOwner && (
                  <button
                    onClick={() => navigate("/beheer/handleidingen")}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  >
                    <FileText size={16} />
                    {t("account.manageManuals")}
                  </button>
                )}
                <div className="border-t border-border/20 mt-3 pt-3">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all w-full text-left"
                  >
                    <LogOut size={16} />
                    {t("account.logout")}
                  </button>
                </div>
              </div>

              {/* Mobile horizontal scroll tabs */}
              <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/50 text-muted-foreground"
                      }`}
                    >
                      <Icon size={14} />
                      {t(tab.labelKey)}
                    </button>
                  );
                })}
                {isOwner && (
                  <button
                    onClick={() => navigate("/beheer/handleidingen")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 bg-secondary/50 text-muted-foreground"
                  >
                    <FileText size={14} />
                    {t("account.manageManuals")}
                  </button>
                )}
              </div>
            </nav>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-card/50 border border-border/20 rounded-2xl p-6 lg:p-8">
                {activeTab === "profile" && <ProfileTab />}
                {activeTab === "addresses" && <AddressesTab />}
                {activeTab === "orders" && <OrdersTab />}
                {activeTab === "password" && <PasswordTab />}
              </div>
            </div>
          </div>

          {/* Mobile logout */}
          <div className="lg:hidden mt-8">
            <Button variant="outline" onClick={handleLogout} className="gap-2 text-destructive hover:text-destructive w-full">
              <LogOut size={16} /> {t("account.logout")}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
