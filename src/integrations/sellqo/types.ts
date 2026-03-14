export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  position: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  compare_at_price?: number;
  sku?: string;
  in_stock: boolean;
  options?: Record<string, string>;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number;
  images: ProductImage[];
  category?: string;
  variants: ProductVariant[];
  product_type?: string;
  in_stock: boolean;
  description?: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  product_name: string;
  product_image?: string;
  variant_title?: string;
  gift_card_metadata?: Record<string, unknown>;
}

export interface Cart {
  id: string;
  items: CartItem[];
  item_count: number;
  subtotal: number;
  total: number;
  discount_code?: string;
  discount_amount?: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  product_count: number;
}

export interface ProductsParams {
  collection?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface AddToCartPayload {
  product_id: string;
  variant_id?: string;
  quantity: number;
  gift_card_metadata?: Record<string, unknown>;
}

export interface CheckoutPayload {
  success_url: string;
  cancel_url: string;
}

export interface StoreSettings {
  store_name: string;
  currency: string;
  [key: string]: unknown;
}

export interface LegalPages {
  [key: string]: unknown;
}
