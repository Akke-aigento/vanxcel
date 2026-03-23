import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct, useRelatedProducts } from '@/integrations/sellqo/hooks';
import { extractSingle, extractArray } from '@/integrations/sellqo/client';
import { normalizeProduct, normalizeProducts } from '@/integrations/sellqo/normalizer';
import { useCartContext } from '@/integrations/sellqo/CartContext';
import type { Product } from '@/integrations/sellqo/types';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Loader2 } from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem, isAddingItem } = useCartContext();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: apiProductData, isLoading } = useProduct(slug || '');
  const { data: apiRelatedData } = useRelatedProducts(slug || '');

  const rawProduct = extractSingle(apiProductData);
  const product: Product | null = rawProduct ? normalizeProduct(rawProduct) : null;

  const rawRelated = extractArray(apiRelatedData);
  const relatedProducts = rawRelated.length > 0 ? normalizeProducts(rawRelated) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-10">
              <div className="aspect-square bg-muted rounded-lg animate-pulse" />
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
                <div className="h-6 bg-muted rounded w-1/4 animate-pulse" />
                <div className="h-20 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 px-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-xl text-muted-foreground mb-4">Product niet gevonden</p>
            <Link to="/shop" className="text-primary hover:underline">← Terug naar shop</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const hasRealVariants = product.variants && product.variants.length > 0;
  const variant = hasRealVariants ? (product.variants[selectedVariant] || product.variants[0]) : undefined;
  const variantPrice = variant?.price ?? product.price ?? 0;
  const mainImage = product.images?.[0]?.url;
  const plainDescription = product.description?.replace(/<[^>]*>/g, '') || '';

  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      variant_id: hasRealVariants ? variant!.id : undefined,
      title: product.title,
      variant_title: variant?.title || '',
      price: variantPrice,
      quantity,
      image: mainImage,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/shop" className="hover:text-primary">Shop</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product.title}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            {/* Image */}
            <div className="aspect-square bg-card border border-border rounded-lg flex items-center justify-center overflow-hidden">
              {mainImage ? (
                <img src={mainImage} alt={product.title} className="w-full h-full object-contain p-6" />
              ) : (
                <span className="text-8xl">📦</span>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">{product.title}</h1>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-primary">€{variantPrice.toFixed(2)}</span>
                {(variant?.compare_at_price || product.compare_at_price) && (
                  <span className="text-muted-foreground line-through">
                    €{(variant?.compare_at_price || product.compare_at_price)?.toFixed(2)}
                  </span>
                )}
              </div>

              {product.stock_status === 'out_of_stock' && (
                <p className="text-sm text-destructive mb-4">● Uitverkocht</p>
              )}
              {product.stock_status === 'low_stock' && (
                <p className="text-sm text-amber-500 mb-4">⚡ Bijna uitverkocht</p>
              )}
              {product.stock_status === 'in_stock' && (
                <p className="text-sm text-green-500 mb-4">● Op voorraad</p>
              )}

              {plainDescription && (
                <p className="text-muted-foreground mb-6 leading-relaxed line-clamp-4">
                  {plainDescription.slice(0, 300)}{plainDescription.length > 300 ? '...' : ''}
                </p>
              )}

              {/* Variant selector */}
              {product.variants.length > 1 && (
                <div className="mb-4">
                  <span className="text-sm font-semibold text-foreground mb-2 block">Variant</span>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v, i) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(i)}
                        className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                          selectedVariant === i
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border hover:border-foreground'
                        } ${v.stock_status === 'out_of_stock' ? 'opacity-40 cursor-not-allowed' : ''}`}
                        disabled={v.stock_status === 'out_of_stock'}
                      >
                        {Object.values(v.options || {})[0] || v.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-semibold">Aantal</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-muted transition-colors">
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-muted transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Add to cart */}
              <Button
                onClick={handleAddToCart}
                disabled={product.stock_status === 'out_of_stock' || isAddingItem}
                size="lg"
                className="w-full"
              >
                {isAddingItem ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Toevoegen...</>
                ) : (
                  'In winkelwagen'
                )}
              </Button>
            </div>
          </div>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <div className="mt-20">
              <h2 className="font-display text-2xl text-foreground mb-8">Gerelateerde producten</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {relatedProducts.slice(0, 4).map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
