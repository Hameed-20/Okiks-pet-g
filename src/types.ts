export type CategoryId = 'cats' | 'birds' | 'rabbits';

export type StockStatus =
  | 'in_stock'
  | 'low_stock'
  | 'out_of_stock'
  | 'confirm_availability';

export interface ProductVariant {
  id: string;
  label: string;
  price: number | null;
  stockStatus: StockStatus;
}

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  brand: string;
  description: string;
  image: string;
  variants: ProductVariant[];
  isFeatured: boolean;
  isBestseller: boolean;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  slug: CategoryId;
  headline: string;
  description: string;
  heroImage: string;
  isActive: boolean;
}

export interface DeliveryZone {
  id: string;
  name: string;
  states: string[];
  fee: number | null;
  estimatedRange: string;
  enabled: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

export interface Testimonial {
  id: string;
  customerName: string;
  roleOrPet: string;
  quote: string;
  createdAt: string;
}

export interface StoreSettings {
  businessName: string;
  tagline: string;
  whatsappNumber: string;
  displayPhone: string;
  address: string;
  yearsOperating: string;
  announcementText: string;
  heroHeadline: string;
  heroSubtext: string;
  aboutText: string;
  pickupInfo: string;
  deliveryNote: string;
  showTestimonials: boolean;
}

export interface StoreData {
  settings: StoreSettings;
  categories: CategoryInfo[];
  products: Product[];
  deliveryZones: DeliveryZone[];
  faqs: FaqItem[];
  testimonials: Testimonial[];
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}
