import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CartDrawer from "@/components/CartDrawer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import logoWhite from "@/assets/logo-white.png";
import { useCollections } from "@/integrations/sellqo/hooks";
import { extractArray } from "@/integrations/sellqo/client";
import { normalizeCollections } from "@/integrations/sellqo/normalizer";
import type { Collection } from "@/integrations/sellqo/types";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopExpanded, setShopExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
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
    { label: t("nav.tools"), href: "/calculator" },
    { label: t("nav.about"), href: "/#about" },
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/">
          <img src={logoWhite} alt="VanXcel" className="h-7" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {/* Shop dropdown */}
          <div className="relative group">
            <Link
              to="/shop"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              {t("nav.shop")}
              <ChevronDown size={14} className="opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>
            <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="bg-popover border border-border rounded-lg shadow-lg py-2 min-w-[220px]">
                <Link
                  to="/shop"
                  className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                >
                  {t("nav.allProducts")}
                </Link>
                {topLevel.length > 0 && (
                  <div className="h-px bg-border my-1 mx-3" />
                )}
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
                                className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
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
                    <Link
                      key={col.id}
                      to={`/shop?collection=${col.slug}`}
                      className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                    >
                      {col.title}
                    </Link>
                  );
                })}
                {topLevel.length > 0 && (
                  <>
                    <div className="h-px bg-border my-1 mx-3" />
                    <Link
                      to="/categories"
                      className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                    >
                      {t("nav.allCategories")}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Other nav links */}
          {navLinks.map((link) =>
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
          <CartDrawer />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-muted-foreground hover:text-foreground"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background border-t border-border px-4 pb-4">
          {/* Shop expandable section */}
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
                <Link
                  to="/shop"
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("nav.allProducts")}
                </Link>
                {topLevel.map((col) => {
                  const children = getChildren(col.id);
                  return (
                    <div key={col.id}>
                      <Link
                        to={`/shop?collection=${col.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {col.title}
                      </Link>
                      {children.length > 0 && (
                        <div className="pl-4">
                          {children.map((child) => (
                            <Link
                              key={child.id}
                              to={`/shop?collection=${child.slug}`}
                              onClick={() => setMobileOpen(false)}
                              className="block py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {child.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                <Link
                  to="/categories"
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  {t("nav.allCategories")}
                </Link>
              </div>
            )}
          </div>

          {/* Other nav links */}
          {navLinks.map((link) =>
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
        </div>
      )}
    </nav>
  );
};

export default Navbar;
