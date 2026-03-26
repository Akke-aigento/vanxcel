import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { sellqoFetch, extractSingle } from "@/integrations/sellqo/client";
import type { SocialLinks, StoreSettings } from "@/integrations/sellqo/types";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";

const socialConfig = [
  { key: "instagram" as const, icon: Instagram, label: "Instagram" },
  { key: "facebook" as const, icon: Facebook, label: "Facebook" },
  { key: "twitter" as const, icon: Twitter, label: "X / Twitter" },
  { key: "youtube" as const, icon: Youtube, label: "YouTube" },
  { key: "tiktok" as const, icon: null, label: "TikTok" },
];

const Footer = () => {
  const { t } = useTranslation();
  const [legalPages, setLegalPages] = useState<{ title: string; url: string; slug: string }[]>([]);
  const [social, setSocial] = useState<SocialLinks>({});
  const [shopName, setShopName] = useState("VANXCEL");

  useEffect(() => {
    sellqoFetch<{ data: { title: string; url: string; slug: string }[] }>("/legal")
      .then((r) => setLegalPages(r?.data || []))
      .catch(() => {});

    sellqoFetch<{ data: StoreSettings }>("/settings")
      .then((r) => {
        if (r?.data?.store?.name) setShopName(r.data.store.name);
        if (r?.data?.social) setSocial(r.data.social);
      })
      .catch(() => {});
  }, []);

  const activeSocials = socialConfig.filter(
    (s) => social[s.key] && social[s.key]!.trim() !== ""
  );

  const categories = [
    { titleKey: "footer.catConverters", slug: "converters" },
    { titleKey: "footer.catBatteries", slug: "accus" },
    { titleKey: "footer.catPowerstations", slug: "powerstations" },
    { titleKey: "footer.catAccessories", slug: "accessoires" },
  ];

  return (
    <footer className="bg-background border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display text-2xl text-foreground mb-4">
              {shopName.toUpperCase()}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("footer.brandDesc")}
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg text-foreground mb-4">{t("footer.shop")}</h4>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/shop?collection=${cat.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {cat.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg text-foreground mb-4">{t("footer.info")}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.faq")}
                </Link>
              </li>
              <li>
                <Link to="/delivery" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.delivery")}
                </Link>
              </li>
              <li>
                <Link to="/manuals" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.manuals")}
                </Link>
              </li>
              {legalPages.map((page) => (
                <li key={page.slug}>
                  <a
                    href={`${page.url}?from=https%3A%2F%2Fwww.vanxcel.be%2F`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {page.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg text-foreground mb-4">
              {t("footer.followUs")}
            </h4>
            {activeSocials.length > 0 && (
              <ul className="space-y-2">
                {activeSocials.map((s) => (
                  <li key={s.key}>
                    <a
                      href={social[s.key]!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {s.icon ? <s.icon size={16} /> : null}
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            {t("footer.copyright", { year: new Date().getFullYear(), name: shopName })}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
