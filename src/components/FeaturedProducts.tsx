import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProducts } from '@/integrations/sellqo/hooks';
import { extractArray } from '@/integrations/sellqo/client';
import { normalizeProducts } from '@/integrations/sellqo/normalizer';
import type { Product } from '@/integrations/sellqo/types';
import ProductCard from './ProductCard';

const FeaturedProducts = () => {
  const { t } = useTranslation();
  const { data: productsData, isLoading } = useProducts({ per_page: 6 });

  const products: Product[] = useMemo(() => {
    if (productsData) {
      const raw = extractArray(productsData);
      if (raw.length > 0) {
        const normalized = normalizeProducts(raw);
        const featured = normalized.filter(p => p.is_featured);
        const rest = normalized.filter(p => !p.is_featured);
        return [...featured, ...rest].slice(0, 6);
      }
    }
    return [];
  }, [productsData]);

  if (isLoading) {
    return (
      <section className="bg-secondary/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-4xl md:text-5xl text-center text-foreground mb-4">{t("bestsellers.title")}</h2>
          <p className="text-center text-muted-foreground mb-12">{t("bestsellers.subtitle")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-lg mb-3" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="bg-secondary/50 py-20">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-4xl md:text-5xl text-center text-foreground mb-4">
          {t("bestsellers.title")}
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          {t("bestsellers.subtitle")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            to="/shop"
            className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            {t("bestsellers.viewAll")}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
