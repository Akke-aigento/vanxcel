import type { Product, ProductImage, ProductVariant, Collection, Cart, CartItem } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeProduct(raw: any): Product {
  if (!raw) return raw;

  // Images: API returns string[] or ProductImage[]
  let rawImages = raw.images || [];
  if ((!Array.isArray(rawImages) || rawImages.length === 0) && raw.image) {
    rawImages = [raw.image];
  }
  const images: ProductImage[] = (Array.isArray(rawImages) ? rawImages : []).map(
    (img: string | ProductImage, i: number) => {
      if (typeof img === 'string') {
        return { id: `img-${i}`, url: img, alt: raw.name || raw.title || '', position: i };
      }
      return img;
    }
  );

  // Variants
  const rawVariants = raw.variants || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variants: ProductVariant[] = rawVariants.map((v: any) => ({
    id: v.id,
    title: v.title || '',
    sku: v.sku || undefined,
    price: v.price ?? raw.price ?? 0,
    compare_at_price: v.compare_at_price || undefined,
    stock_status: v.in_stock === false ? 'out_of_stock' : (v.stock != null && v.stock > 0 && v.stock <= 3 ? 'low_stock' : 'in_stock'),
    stock_quantity: v.stock ?? undefined,
    options: v.attribute_values || {},
    image: v.image_url ? { id: v.id, url: v.image_url, alt: v.title, position: 0 } : undefined,
  }));

  const stockStatus = raw.in_stock === false
    ? 'out_of_stock'
    : (raw.stock != null && raw.stock > 0 && raw.stock <= 3 ? 'low_stock' : 'in_stock');

  // Bundle items
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bundleItems = raw.bundle_items?.map((bi: any) => ({
    id: bi.id,
    product_id: bi.product_id || bi.product?.id,
    quantity: bi.quantity ?? 1,
    is_required: bi.is_required,
    customer_can_adjust: bi.customer_can_adjust,
    min_quantity: bi.min_quantity,
    max_quantity: bi.max_quantity,
    sort_order: bi.sort_order,
    product: {
      id: bi.product?.id || '',
      name: bi.product?.name || '',
      price: bi.product?.price ?? 0,
      image: bi.product?.image || bi.product?.images?.[0] || null,
      slug: bi.product?.slug || '',
      in_stock: bi.product?.in_stock ?? true,
    },
  })) || undefined;
  const bundleIndividualTotal = raw.bundle_individual_total ?? undefined;
  const bundleSavings = raw.bundle_savings ?? undefined;

  return {
    id: raw.id,
    slug: raw.slug || '',
    title: raw.name || raw.title || 'Untitled',
    description: raw.description || '',
    short_description: raw.short_description || undefined,
    price: raw.price ?? 0,
    compare_at_price: raw.compare_at_price || undefined,
    currency: raw.currency || 'EUR',
    images,
    variants,
    collection: raw.category?.slug || raw.collection || undefined,
    collections: raw.collections || undefined,
    category: raw.category || undefined,
    tags: raw.tags || [],
    stock_status: stockStatus as Product['stock_status'],
    stock_quantity: raw.stock ?? undefined,
    sku: raw.sku || undefined,
    product_type: raw.product_type || undefined,
    is_featured: raw.is_featured || false,
    created_at: raw.created_at || '',
    updated_at: raw.updated_at || '',
    bundle_items: bundleItems,
    bundle_individual_total: bundleIndividualTotal,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeCollection(raw: any): Collection {
  return {
    id: raw.id,
    slug: raw.slug || '',
    title: raw.name || raw.title || 'Untitled',
    description: raw.description || undefined,
    image: raw.image_url || raw.image || undefined,
    product_count: raw.product_count ?? undefined,
    parent_id: raw.parent_id || undefined,
  };
}

export function normalizeProducts(rawProducts: unknown[]): Product[] {
  return (rawProducts || []).map(normalizeProduct);
}

export function normalizeCollections(rawCollections: unknown[]): Collection[] {
  return (rawCollections || []).map(normalizeCollection);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeCartItem(raw: any): CartItem {
  if (!raw) return raw;
  return {
    id: raw.id || '',
    product_id: raw.product_id || raw.product?.id || '',
    variant_id: raw.variant_id || raw.variant?.id || '',
    title: raw.title || raw.product_name || raw.product?.name || 'Product',
    variant_title: raw.variant_title || raw.variant?.title || '',
    price: raw.price ?? raw.unit_price ?? 0,
    quantity: raw.quantity ?? 1,
    image: raw.image || raw.product_image || raw.product?.image || raw.product?.images?.[0] || undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeCart(raw: any): Cart {
  if (!raw) return raw;
  const items = (raw.items || []).map(normalizeCartItem);
  const itemCount = raw.item_count ?? items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0);
  const subtotal = raw.subtotal ?? items.reduce((sum: number, i: CartItem) => sum + i.price * i.quantity, 0);

  return {
    id: raw.id || '',
    items,
    item_count: itemCount,
    subtotal,
    total: raw.total ?? subtotal,
    currency: raw.currency || 'EUR',
    discount_code: raw.discount_code ?? undefined,
    discount_amount: raw.discount_amount ?? undefined,
  };
}
