const Footer = () => (
  <footer className="bg-background border-t border-border py-16">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <h3 className="font-display text-2xl text-foreground mb-4">VANXCEL</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Fueling Your Journey. Off-grid power oplossingen voor campervans, gemaakt in België.
          </p>
        </div>

        {/* Shop */}
        <div>
          <h4 className="font-display text-lg text-foreground mb-4">SHOP</h4>
          <ul className="space-y-2">
            {["Converters", "Batteries", "Powerstations", "Accessories"].map((item) => (
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
            ))}
          </ul>
        </div>

        {/* Info */}
        <div>
          <h4 className="font-display text-lg text-foreground mb-4">INFO</h4>
          <ul className="space-y-2">
            {[
              { label: "Over ons", href: "https://www.vanxcel.be/pages/about-us" },
              { label: "Levering", href: "https://www.vanxcel.be/pages/delivery" },
              { label: "FAQ", href: "https://www.vanxcel.be/pages/faq" },
              { label: "Contact", href: "https://www.vanxcel.be/pages/contact" },
            ].map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="font-display text-lg text-foreground mb-4">VOLG ONS</h4>
          <ul className="space-y-2">
            <li>
              <a
                href="https://www.facebook.com/share/16XoMgHfmJ/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Facebook
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/vanxcel.shop/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          © 2025 VanXcel. Alle rechten voorbehouden. 🇧🇪 Made in Belgium.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
