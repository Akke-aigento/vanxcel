import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCollections } from '@/integrations/sellqo/hooks';
import { extractArray } from '@/integrations/sellqo/client';
import { normalizeCollections } from '@/integrations/sellqo/normalizer';
import type { Collection } from '@/integrations/sellqo/types';
import { useIsMobile } from '@/hooks/use-mobile';

const categoryImages: Record<string, string> = {
  converters: "https://www.vanxcel.be/cdn/shop/files/Converters_grouped.png?v=1754123623&width=800",
  accus: "https://www.vanxcel.be/cdn/shop/files/Batteries_grouped_f6861d1d-6356-46fe-b513-ee1a69a8ea3c.png?v=1750273232&width=800",
  powerstations: "https://www.vanxcel.be/cdn/shop/files/Powerstation_grouped.png?v=1750407560&width=800",
  accessoires: "https://www.vanxcel.be/cdn/shop/files/Qcc_grouped.png?v=1751140713&width=800",
  kortingspakketten: "https://www.vanxcel.be/cdn/shop/files/TheBIG300.png?v=1742922194&width=600",
};

const CategoryGrid = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { data: collectionsData, isLoading } = useCollections();

  const collections: Collection[] = useMemo(() => {
    if (collectionsData) {
      const raw = extractArray(collectionsData);
      if (raw.length > 0) {
        return normalizeCollections(raw).filter(c => !c.parent_id);
      }
    }
    return [];
  }, [collectionsData]);

  if (isLoading) {
    return (
      <section id="products" className="bg-background py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-4xl md:text-5xl text-center text-foreground mb-4">{t("categories.title")}</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">{t("categories.subtitle")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-lg mb-3" />
                <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (collections.length === 0) return null;

  return (
    <section id="products" className="bg-background py-20">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-4xl md:text-5xl text-center text-foreground mb-4">
          {t("categories.title")}
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          {t("categories.subtitle")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((col) => (
            <Link
              key={col.id}
              to={`/shop?collection=${col.slug}`}
              className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-all duration-300"
            >
              <div className="aspect-square p-6 flex items-center justify-center bg-card">
                {(col.image || categoryImages[col.slug]) ? (
                  <img
                    src={col.image || categoryImages[col.slug]}
                    alt={col.title}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <span className="text-6xl text-muted-foreground">📦</span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl text-foreground mb-2">{col.title}</h3>
                {col.product_count != null && col.product_count > 0 && (
                  <p className="text-sm text-muted-foreground">{col.product_count} {t("categories.products")}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
