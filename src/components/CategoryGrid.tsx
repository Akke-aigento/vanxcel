const categories = [
  {
    title: "Converters",
    description: "All-in-one 5-in-1 converters met MPPT solar, AC & DC — compact en off-grid ready.",
    image: "https://www.vanxcel.be/cdn/shop/files/Converters_grouped.png?v=1754123623&width=800",
    href: "https://www.vanxcel.be/collections/converters-1",
  },
  {
    title: "Batteries",
    description: "LiFePO4 batterijen voor campervans. Licht, veilig en langdurig — 200Ah & 300Ah.",
    image: "https://www.vanxcel.be/cdn/shop/files/Batteries_grouped_f6861d1d-6356-46fe-b513-ee1a69a8ea3c.png?v=1750273232&width=800",
    href: "https://www.vanxcel.be/collections/batteries",
  },
  {
    title: "Powerstations",
    description: "Draagbaar vermogen met AC, DC, solar & USB — perfect voor vanlife en remote work.",
    image: "https://www.vanxcel.be/cdn/shop/files/Powerstation_grouped.png?v=1750407560&width=800",
    href: "https://www.vanxcel.be/collections/powerstations",
  },
  {
    title: "Accessories",
    description: "Zekeringen, verdeelblokken en meer — gebouwd voor off-grid betrouwbaarheid.",
    image: "https://www.vanxcel.be/cdn/shop/files/Qcc_grouped.png?v=1751140713&width=800",
    href: "https://www.vanxcel.be/collections/accessories",
  },
];

const CategoryGrid = () => (
  <section id="products" className="bg-background py-20">
    <div className="container mx-auto px-4">
      <h2 className="font-display text-4xl md:text-5xl text-center text-foreground mb-4">
        SHOP BY CATEGORY
      </h2>
      <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
        Alles wat je nodig hebt voor een volledig powered campervan
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <a
            key={cat.title}
            href={cat.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-all duration-300"
          >
            <div className="aspect-square p-6 flex items-center justify-center bg-card">
              <img
                src={cat.image}
                alt={cat.title}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5">
              <h3 className="font-display text-xl text-foreground mb-2">{cat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{cat.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  </section>
);

export default CategoryGrid;
