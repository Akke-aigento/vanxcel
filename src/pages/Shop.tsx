import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts, useCollections } from '@/integrations/sellqo/hooks';
import { extractArray } from '@/integrations/sellqo/client';
import { normalizeProducts, normalizeCollections } from '@/integrations/sellqo/normalizer';
import type { Product, Collection } from '@/integrations/sellqo/types';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCollection = searchParams.get('collection') || 'all';
  const [sort, setSort] = useState('newest');

  const sortParam = sort === 'price-asc' ? 'price_asc' : sort === 'price-desc' ? 'price_desc' : 'newest';

  const { data: productsData, isLoading: productsLoading } = useProducts({
    collection: activeCollection !== 'all' ? activeCollection : undefined,
    sort: sortParam as 'newest' | 'price_asc' | 'price_desc',
  });

  const { data: collectionsData } = useCollections();

  const products: Product[] = useMemo(() => {
    if (productsData) {
      const rawProducts = extractArray(productsData);
      if (rawProducts.length > 0) {
        return normalizeProducts(rawProducts);
      }
    }
    return [];
  }, [productsData]);

  const collections: Collection[] = useMemo(() => {
    if (collectionsData) {
      const rawCollections = extractArray(collectionsData);
      if (rawCollections.length > 0) {
        return normalizeCollections(rawCollections).filter(c => !c.parent_id);
      }
    }
    return [];
  }, [collectionsData]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <h1 className="font-display text-4xl md:text-5xl text-center text-foreground mb-10">
            SHOP
          </h1>

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSearchParams({})}
                className={`px-4 py-2 rounded-full text-sm border transition-all ${
                  activeCollection === 'all'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                }`}
              >
                Alles
              </button>
              {collections.map(col => (
                <button
                  key={col.slug}
                  onClick={() => setSearchParams({ collection: col.slug })}
                  className={`px-4 py-2 rounded-full text-sm border transition-all ${
                    activeCollection === col.slug
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                  }`}
                >
                  {col.title}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="newest">Nieuwste</option>
              <option value="price-asc">Prijs: laag → hoog</option>
              <option value="price-desc">Prijs: hoog → laag</option>
            </select>
          </div>

          {/* Product grid */}
          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-muted rounded-lg mb-3" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">Geen producten gevonden</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
