import httpClient from './client';
import type { Order, CreateOrderRequest, OrderStatus } from '../types/order.types';

export const ordersApi = {
  create: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await httpClient.post('/orders', data);
    return response.data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response = await httpClient.get('/orders/my-orders');
    return response.data;
  },

  getById: async (orderId: string): Promise<Order> => {
    const response = await httpClient.get(`/orders/${orderId}`);
    return response.data;
  },

  updateStatus: async (orderId: string, status: OrderStatus): Promise<Order> => {
    const response = await httpClient.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },
};
