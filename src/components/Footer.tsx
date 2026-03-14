import { useEffect, useState } from "react";
import { sellqoFetch } from "@/integrations/sellqo/client";
import type { LegalPage, SocialLinks } from "@/integrations/sellqo/types";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";

const socialConfig = [
  { key: "instagram" as const, icon: Instagram, label: "Instagram" },
  { key: "facebook" as const, icon: Facebook, label: "Facebook" },
  { key: "twitter" as const, icon: Twitter, label: "X / Twitter" },
  { key: "youtube" as const, icon: Youtube, label: "YouTube" },
  { key: "tiktok" as const, icon: null, label: "TikTok" },
];

const Footer = () => {
  const [legalPages, setLegalPages] = useState<LegalPage[]>([]);
  const [social, setSocial] = useState<SocialLinks>({});
  const [shopName, setShopName] = useState("VANXCEL");

  useEffect(() => {
    sellqoFetch<{ data: LegalPage[] }>("/legal")
      .then((r) => setLegalPages(r?.data || []))
      .catch(() => {});

    sellqoFetch<{ data: { shop_name?: string; social?: SocialLinks } }>("/settings")
      .then((r) => {
        if (r?.data?.shop_name) setShopName(r.data.shop_name);
        if (r?.data?.social) setSocial(r.data.social);
      })
      .catch(() => {});
  }, []);

  const activeSocials = socialConfig.filter(
    (s) => social[s.key] && social[s.key]!.trim() !== ""
  );

  return (
    <footer className="bg-background border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl text-foreground mb-4">
              {shopName.toUpperCase()}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fueling Your Journey. Off-grid power oplossingen voor campervans,
              gemaakt in België.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-display text-lg text-foreground mb-4">SHOP</h4>
            <ul className="space-y-2">
              {["Converters", "Batteries", "Powerstations", "Accessories"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href={`https://www.vanxcel.be/collections/${item.toLowerCase()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display text-lg text-foreground mb-4">INFO</h4>
            <ul className="space-y-2">
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

          {/* Social */}
          <div>
            <h4 className="font-display text-lg text-foreground mb-4">
              VOLG ONS
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
            © {new Date().getFullYear()} {shopName}. Alle rechten voorbehouden.
            🇧🇪 Made in Belgium.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
