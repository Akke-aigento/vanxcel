import { Menu, X, ChevronDown, ChevronRight, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "@/hooks/use-toast";
import CartDrawer from "@/components/CartDrawer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import logoWhite from "@/assets/logo-white.png";
import { useCollections } from "@/integrations/sellqo/hooks";
import { extractArray } from "@/integrations/sellqo/client";
import { normalizeCollections } from "@/integrations/sellqo/normalizer";
import type { Collection } from "@/integrations/sellqo/types";
import { useCustomerAuth } from "@/integrations/sellqo/CustomerAuthContext";

const toolItems = [
  { labelKey: "toolsHub.tabPower", href: "/calculator", icon: "⚡" },
  { labelKey: "toolsHub.tabCable", href: "/calculator?tab=cable", icon: "🔌" },
  { labelKey: "toolsHub.tabBuild", href: "/calculator?tab=build", icon: "🛠️" },
  { labelKey: "configurator.navLabel", href: "/configurator", icon: "🚐", comingSoon: true },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopExpanded, setShopExpanded] = useState(false);
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, customer, logout } = useCustomerAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const { t } = useTranslation();
  const { data: collectionsData } = useCollections();

  const collections: Collection[] = useMemo(() => {
    if (!collectionsData) return [];
    const raw = extractArray(collectionsData);
    return raw.length > 0 ? normalizeCollections(raw) : [];
  }, [collectionsData]);

  const topLevel = useMemo(() => collections.filter(c => !c.parent_id), [collections]);
  const getChildren = (parentId: string) => collections.filter(c => c.parent_id === parentId);

  const navLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.about"), href: "/about" },
    { label: t("nav.contact"), href: "/contact" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const id = href.slice(2);
      if (location.pathname === "/") {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/");
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
    setMobileOpen(false);
  };

  const dropdownLinkClass =
    "block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border transition-all duration-300 ${scrolled ? "bg-background/95 shadow-md" : "bg-background/80"}`}>
      <div className="container mx-auto flex items-center justify-between h-20 px-4">
        <Link to="/">
          <img
            src={logoWhite}
            alt="VanXcel"
            className="h-9 transition-transform duration-300"
            style={{ transform: scrolled ? "scale(0.85)" : "scale(1)", filter: scrolled ? "drop-shadow(0 0 6px hsl(185 100% 29% / 0.4))" : "none" }}
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {/* Home */}
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("nav.home")}
          </Link>

          {/* Shop dropdown */}
          <div className="relative group">
            <button
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              {t("nav.shop")}
              <ChevronDown size={14} className="opacity-60 group-hover:opacity-100 transition-opacity" />
            </button>
            <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="bg-popover border border-border rounded-lg shadow-lg py-2 min-w-[220px]">
                <Link to="/shop" className={dropdownLinkClass}>
                  {t("nav.allProducts")}
                </Link>
                {topLevel.length > 0 && <div className="h-px bg-border my-1 mx-3" />}
                {topLevel.map((col) => {
                  const children = getChildren(col.id);
                  if (children.length > 0) {
                    return (
                      <div key={col.id} className="relative group/sub">
                        <Link
                          to={`/shop?collection=${col.slug}`}
                          className="flex items-center justify-between px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                        >
                          {col.title}
                          <ChevronRight size={14} className="opacity-40" />
                        </Link>
                        <div className="absolute left-full top-0 pl-1 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200">
                          <div className="bg-popover border border-border rounded-lg shadow-lg py-2 min-w-[200px]">
                            {children.map((child) => (
                              <Link
                                key={child.id}
                                to={`/shop?collection=${child.slug}`}
                                className={dropdownLinkClass}
                              >
                                {child.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <Link key={col.id} to={`/shop?collection=${col.slug}`} className={dropdownLinkClass}>
                      {col.title}
                    </Link>
                  );
                })}
                {topLevel.length > 0 && (
                  <>
                    <div className="h-px bg-border my-1 mx-3" />
                    <Link to="/categories" className={dropdownLinkClass}>
                      {t("nav.allCategories")}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tools dropdown */}
          <div className="relative group">
            <button
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              {t("nav.tools")}
              <ChevronDown size={14} className="opacity-60 group-hover:opacity-100 transition-opacity" />
            </button>
            <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="bg-popover border border-border rounded-lg shadow-lg py-2 min-w-[220px]">
                <Link to="/calculator" className={dropdownLinkClass}>
                  {t("nav.allTools")}
                </Link>
                <div className="h-px bg-border my-1 mx-3" />
                {toolItems.map((item) => (
                  <Link key={item.href} to={item.href} className={`${dropdownLinkClass} flex items-center justify-between`}>
                    <span>{item.icon} {t(item.labelKey)}</span>
                    {item.comingSoon && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-accent text-accent-foreground">Soon</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* About & Contact */}
          {navLinks.slice(1).map((link) =>
            link.href.startsWith("/#") ? (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {/* Account icon — desktop */}
          <div className="hidden md:block relative">
            {isAuthenticated ? (
              <div className="relative group">
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title={customer?.first_name || ""}
                >
                  <User size={20} />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-popover border border-border rounded-lg shadow-lg py-2 min-w-[180px] z-50">
                    <Link
                      to="/account"
                      onClick={() => setAccountOpen(false)}
                      className={dropdownLinkClass}
                    >
                      {t("account.myAccount")}
                    </Link>
                    <button
                      onClick={() => { logout(); setAccountOpen(false); }}
                      className={`${dropdownLinkClass} w-full text-left text-destructive`}
                    >
                      {t("account.logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                <User size={20} />
              </Link>
            )}
          </div>
          <CartDrawer />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-muted-foreground hover:text-foreground"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-t border-border px-4 pb-4">
          {/* Home */}
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="block py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("nav.home")}
          </Link>

          {/* Shop expandable */}
          <div>
            <button
              onClick={() => setShopExpanded(!shopExpanded)}
              className="flex items-center justify-between w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("nav.shop")}
              <ChevronDown size={16} className={`transition-transform ${shopExpanded ? "rotate-180" : ""}`} />
            </button>
            {shopExpanded && (
              <div className="pl-4 pb-2 space-y-1">
                <Link to="/shop" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.allProducts")}
                </Link>
                {topLevel.map((col) => {
                  const children = getChildren(col.id);
                  return (
                    <div key={col.id}>
                      <Link to={`/shop?collection=${col.slug}`} onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {col.title}
                      </Link>
                      {children.length > 0 && (
                        <div className="pl-4">
                          {children.map((child) => (
                            <Link key={child.id} to={`/shop?collection=${child.slug}`} onClick={() => setMobileOpen(false)} className="block py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                              {child.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                <Link to="/categories" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                  {t("nav.allCategories")}
                </Link>
              </div>
            )}
          </div>

          {/* Tools expandable */}
          <div>
            <button
              onClick={() => setToolsExpanded(!toolsExpanded)}
              className="flex items-center justify-between w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("nav.tools")}
              <ChevronDown size={16} className={`transition-transform ${toolsExpanded ? "rotate-180" : ""}`} />
            </button>
            {toolsExpanded && (
              <div className="pl-4 pb-2 space-y-1">
                <Link to="/calculator" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.allTools")}
                </Link>
                {toolItems.map((item) => (
                  <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)} className="flex items-center justify-between py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <span>{item.icon} {t(item.labelKey)}</span>
                    {item.comingSoon && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-accent text-accent-foreground">Soon</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* About & Contact */}
          {navLinks.slice(1).map((link) =>
            link.href.startsWith("/#") ? (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="block py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            )
          )}

          {/* Account — mobile */}
          {isAuthenticated ? (
            <>
              <Link to="/account" onClick={() => setMobileOpen(false)} className="block py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("account.myAccount")}
              </Link>
              <button onClick={() => { logout(); setMobileOpen(false); }} className="block py-3 text-sm text-destructive hover:text-destructive/80 transition-colors w-full text-left">
                {t("account.logout")}
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("auth.login")}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
