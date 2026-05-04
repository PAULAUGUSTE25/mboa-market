export type ListingStatus = 'DRAFT' | 'PUBLISHED' | 'SOLD' | 'EXPIRED' | 'CANCELLED';

export interface ListingPhoto {
  id: string;
  storage_key: string;
  position: number;
}

export interface Listing {
  id: string;
  seller_id: string;
  category_id: string;
  title: string;
  variety?: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  currency: string;
  region: string;
  locality?: string;
  status: ListingStatus;
  photos: ListingPhoto[];
  images: string[];
  created_at: string;
  updated_at: string;
  seller?: {
    profile?: {
      display_name: string;
      activity_type: string;
      domain?: string;
    };
  };
}

export interface ListingCreateRequest {
  category_id: string;
  product_ref_id?: string;
  title: string;
  variety?: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  currency?: string;
  region: string;
  locality?: string;
  available_from?: string;
}

export interface ListingUpdateRequest extends Partial<ListingCreateRequest> {
  status?: ListingStatus;
}

export interface Category {
  id: string;
  name_fr: string;
  name_en: string;
  kind: 'agriculture' | 'elevage';
}

export interface Product {
  id: string;
  name_fr: string;
  name_en?: string;
  unit_default: string;
  category_id: string;
}

export interface PaginatedListings {
  items: Listing[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface ListingFilters {
  page?: number;
  page_size?: number;
  category_id?: string;
  region?: string;
  status?: ListingStatus;
}
