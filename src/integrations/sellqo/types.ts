// === BUNDLE ===
export interface BundleItem {
  id?: string;
  product_id: string;
  quantity: number;
  is_required?: boolean;
  customer_can_adjust?: boolean;
  min_quantity?: number;
  max_quantity?: number | null;
  sort_order?: number;
  product: { id: string; name: string; price: number; image: string | null; slug: string; in_stock?: boolean };
}

// === PRODUCTS ===
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
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  stock_quantity?: number;
  options: Record<string, string>;
  image?: ProductImage;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  short_description?: string;
  price: number;
  compare_at_price?: number;
  currency: string;
  images: ProductImage[];
  variants: ProductVariant[];
  collection?: string;
  collections?: string[];
  category?: { id: string; slug: string; name: string };
  tags?: string[];
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  stock_quantity?: number;
  sku?: string;
  product_type?: 'physical' | 'digital' | 'service' | 'subscription' | 'bundle' | 'gift_card';
  bundle_savings?: number;
  bundle_pricing_model?: string;
  bundle_discount_type?: string;
  bundle_discount_value?: number;
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
  bundle_items?: BundleItem[];
  bundle_individual_total?: number;
}

// === COLLECTIONS ===
export interface Collection {
  id: string;
  slug: string;
  title: string;
  description?: string;
  image?: string;
  product_count?: number;
  parent_id?: string;
}

// === CART ===
export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string;
  title: string;
  variant_title: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  item_count: number;
  subtotal: number;
  total: number;
  currency: string;
  discount_code?: string;
  discount_amount?: number;
}

// === CHECKOUT ===
export interface CheckoutSession {
  id: string;
  checkout_url: string;
  cart_id: string;
}

// === CHECKOUT MULTI-STEP ===
export interface PaymentMethod {
  method: string; // 'bancontact' | 'ideal' | 'card' | 'klarna' | 'bank_transfer'
  group: 'direct' | 'later' | 'transfer';
  name: string;
  description?: string;
  fee_cents?: number;
  available: boolean;
  reason_unavailable?: string | null;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  estimated_days?: string;
}

export interface CheckoutOrderItem {
  id: string;
  product_id: string;
  title: string;
  variant_title?: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface CheckoutStartData {
  order_id: string;
  items: CheckoutOrderItem[];
  available_payment_methods: PaymentMethod[];
  available_shipping_methods: ShippingMethod[];
  subtotal: number;
  total: number;
  currency: string;
}

export interface CheckoutCompleteData {
  payment_type: 'redirect' | 'manual' | 'qr';
  checkout_url?: string;
  order_number?: string;
  total?: number;
  currency?: string;
  bank_details?: {
    iban: string;
    account_holder: string;
    reference: string;
  };
  qr_data?: {
    image_url?: string;
    payload?: string;
  };
}

export interface CustomerData {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  // B2B (optional — only sent when the customer orders as a business)
  is_b2b?: boolean;
  company_name?: string;
  vat_number?: string;
  vat_verified?: boolean;
  vat_country?: string;
  vat_company_name?: string;
}

export interface AddressData {
  street: string;
  city: string;
  postal_code: string;
  country: string;
  company?: string;
}

// === PARAMS ===
export interface ProductsParams {
  collection?: string;
  category?: string;
  search?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  page?: number;
  per_page?: number;
}

export interface AddToCartPayload {
  product_id: string;
  variant_id?: string;
  quantity: number;
}

export interface CheckoutPayload {
  cart_id: string;
  success_url: string;
  cancel_url: string;
}

// === LEGAL & SETTINGS ===
export interface LegalPage {
  title: string;
  url: string;
  slug: string;
}

export interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
}

export interface StoreSettings {
  store?: {
    name: string;
    currency: string;
    logo_url?: string;
    favicon_url?: string;
    country?: string;
    vat_rate?: number;
  };
  social?: SocialLinks;
  [key: string]: unknown;
}
