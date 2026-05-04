export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  currency: string;
  status: OrderStatus;
  delivery_address?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderRequest {
  listing_id: string;
  quantity: number;
  delivery_address?: string;
}
