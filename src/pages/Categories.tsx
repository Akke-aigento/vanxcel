import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCollections } from "@/integrations/sellqo/hooks";
import { extractArray } from "@/integrations/sellqo/client";
import { normalizeCollections } from "@/integrations/sellqo/normalizer";
import type { Collection } from "@/integrations/sellqo/types";

const categoryImages: Record<string, string> = {
  converters: "https://www.vanxcel.be/cdn/shop/files/Converters_grouped.png?v=1754123623&width=800",
  accus: "https://www.vanxcel.be/cdn/shop/files/Batteries_grouped_f6861d1d-6356-46fe-b513-ee1a69a8ea3c.png?v=1750273232&width=800",
  powerstations: "https://www.vanxcel.be/cdn/shop/files/Powerstation_grouped.png?v=1750407560&width=800",
  accessoires: "https://www.vanxcel.be/cdn/shop/files/Qcc_grouped.png?v=1751140713&width=800",
  kortingspakketten: "https://www.vanxcel.be/cdn/shop/files/TheBIG300.png?v=1742922194&width=600",
};

const Categories = () => {
  const { t } = useTranslation();
  const { data: collectionsData, isLoading } = useCollections();

  const collections: Collection[] = useMemo(() => {
    if (!collectionsData) return [];
    const raw = extractArray(collectionsData);
    return raw.length > 0 ? normalizeCollections(raw) : [];
  }, [collectionsData]);

  const topLevel = useMemo(() => collections.filter(c => !c.parent_id), [collections]);
  const getChildren = (parentId: string) => collections.filter(c => c.parent_id === parentId);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl text-center text-foreground mb-4">
            {t("categories.pageTitle")}
          </h1>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            {t("categories.pageSubtitle")}
          </p>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-muted rounded-lg mb-3" />
                  <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-16">
              {topLevel.map((col) => {
                const children = getChildren(col.id);
                return (
                  <div key={col.id}>
                    <Link
                      to={`/shop?collection=${col.slug}`}
                      className="group block bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-all duration-300 mb-6"
                    >
                      <div className="flex flex-col sm:flex-row items-center">
                        <div className="w-full sm:w-1/3 aspect-square p-6 flex items-center justify-center bg-card">
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
                        <div className="p-6 sm:p-8 flex-1">
                          <h2 className="font-display text-2xl md:text-3xl text-foreground mb-2">{col.title}</h2>
                          {col.description && (
                            <div
                              className="text-muted-foreground mb-2 prose prose-sm prose-invert max-w-none [&>p]:mb-1 [&>p]:text-muted-foreground line-clamp-3"
                              dangerouslySetInnerHTML={{ __html: col.description }}
                            />
                          )}
                          {col.product_count != null && col.product_count > 0 && (
                            <p className="text-sm text-muted-foreground">{col.product_count} {t("categories.products")}</p>
                          )}
                        </div>
                      </div>
                    </Link>

                    {children.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pl-4 border-l-2 border-primary/20">
                        {children.map((child) => (
                          <Link
                            key={child.id}
                            to={`/shop?collection=${child.slug}`}
                            className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-all duration-300 p-5"
                          >
                            <h3 className="font-display text-lg text-foreground mb-1 group-hover:text-primary transition-colors">{child.title}</h3>
                            {child.product_count != null && child.product_count > 0 && (
                              <p className="text-sm text-muted-foreground">{child.product_count} {t("categories.products")}</p>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Categories;
