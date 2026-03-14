const products = [
  {
    name: "VanXcel 5-in-1 Converter 1000W",
    price: "€449,95",
    image: "https://www.vanxcel.be/cdn/shop/files/VanXcel1000W.png?v=1742922139&width=600",
    href: "https://www.vanxcel.be/products/vanxcel-5-in-1-converter-1000w",
  },
  {
    name: "VanXcel 5-in-1 Converter 1500W",
    price: "€549,95",
    image: "https://www.vanxcel.be/cdn/shop/files/VanXcel1500W.png?v=1742922154&width=600",
    href: "https://www.vanxcel.be/products/vanxcel-5-in-1-converter-1500w",
  },
  {
    name: "VanXcel 200Ah LiFePO4 Battery",
    price: "€379,95",
    image: "https://www.vanxcel.be/cdn/shop/files/200ahVanXcel.png?v=1742922045&width=600",
    href: "https://www.vanxcel.be/products/vanxcel-200ah-lifepo4-battery",
  },
  {
    name: "VanXcel 300Ah LiFePO4 Battery",
    price: "€479,95",
    image: "https://www.vanxcel.be/cdn/shop/files/300ahvanxcel.png?v=1742922066&width=600",
    href: "https://www.vanxcel.be/products/vanxcel-300ah-lifepo4-battery",
  },
  {
    name: "VanXcel 1000W Powerstation",
    price: "€399,95",
    image: "https://www.vanxcel.be/cdn/shop/files/Powerstation1000_6fb38e53-4f46-4a82-89e5-f58e3e1b93dc.png?v=1750407418&width=600",
    href: "https://www.vanxcel.be/products/powerstation-1000w",
  },
  {
    name: "VanXcel TheBIG Kit 1500W + 300Ah",
    price: "€899,95",
    originalPrice: "€1.029,90",
    image: "https://www.vanxcel.be/cdn/shop/files/TheBIG300.png?v=1742922194&width=600",
    href: "https://www.vanxcel.be/products/vanxcel-thebig-300ah",
  },
];

const FeaturedProducts = () => (
  <section className="bg-secondary/50 py-20">
    <div className="container mx-auto px-4">
      <h2 className="font-display text-4xl md:text-5xl text-center text-foreground mb-4">
        BESTSELLERS
      </h2>
      <p className="text-center text-muted-foreground mb-12">
        De populairste producten van VanXcel
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <a
            key={product.name}
            href={product.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-all duration-300"
          >
            <div className="aspect-square bg-foreground/[0.03] p-8 flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <div className="p-5">
              <h3 className="text-sm font-medium text-foreground mb-2 line-clamp-2">
                {product.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">{product.price}</span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {product.originalPrice}
                  </span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturedProducts;
