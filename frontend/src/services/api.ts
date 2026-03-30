import axios, { AxiosInstance } from 'axios';
import { localAuth } from './localAuth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const USE_LOCAL_AUTH = true; // Forcer l'auth locale car le backend n'a pas les routes d'auth

interface RegisterRequest {
  phone: string;
  password: string;
  email?: string;
  profile: {
    display_name: string;
    activity_type: string;
    region: string;
    locality?: string;
    bio?: string;
  };
}

interface LoginRequest {
  phone: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: any;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async register(data: RegisterRequest): Promise<any> {
    // Utiliser l'authentification locale
    console.log('📱 Utilisation de l\'authentification locale');
    const user = await localAuth.register(data);
    return user;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Utiliser l'authentification locale
    console.log('📱 Utilisation de l\'authentification locale');
    const user = await localAuth.login(credentials);
    return {
      access_token: 'local_token',
      refresh_token: 'local_refresh',
      token_type: 'bearer',
      user
    };
  }

  async logout(): Promise<void> {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  async getCurrentUser(): Promise<any> {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  async updateProfile(data: any): Promise<any> {
    const response = await this.client.put('/users/me/profile', data);
    return response.data;
  }

  async getCategories(): Promise<any[]> {
    const response = await this.client.get('/listings/categories/all');
    return response.data;
  }

  async getProducts(): Promise<any[]> {
    const response = await this.client.get('/listings/products/all');
    return response.data;
  }

  async getListings(params?: {
    page?: number;
    page_size?: number;
    category_id?: string;
    region?: string;
    status?: string;
  }): Promise<PaginatedResponse<any>> {
    const response = await this.client.get('/listings', { params });
    return response.data;
  }

  async getListing(id: string): Promise<any> {
    const response = await this.client.get(`/listings/${id}`);
    return response.data;
  }

  async createListing(data: any): Promise<any> {
    const response = await this.client.post('/listings', data);
    return response.data;
  }

  async updateListing(id: string, data: any): Promise<any> {
    const response = await this.client.put(`/listings/${id}`, data);
    return response.data;
  }

  async deleteListing(id: string): Promise<void> {
    await this.client.delete(`/listings/${id}`);
  }

  async getMyListings(): Promise<any[]> {
    const response = await this.client.get('/listings/my/listings');
    return response.data;
  }

  async getConversations(): Promise<any[]> {
    const response = await this.client.get('/messages/conversations');
    // Handle paginated response
    const data = response.data;
    return data.items || data || [];
  }

  async getConversation(conversationId: string): Promise<any> {
    const response = await this.client.get(`/messages/conversations/${conversationId}/messages`);
    // Handle paginated response
    const data = response.data;
    return data.items || data || [];
  }

  async sendMessage(conversationId: string, content: string): Promise<any> {
    const response = await this.client.post(
      `/messages/conversations/${conversationId}/messages`,
      null,
      { params: { content } }
    );
    return response.data;
  }

  async createConversation(data: {
    participant_user_id: string;
    listing_id?: string;
    initial_message: string;
  }): Promise<any> {
    const response = await this.client.post('/messages/conversations', data);
    return response.data;
  }

  async createOrder(data: {
    listing_id: string;
    quantity: number;
    delivery_address?: string;
  }): Promise<any> {
    const response = await this.client.post('/orders', data);
    return response.data;
  }

  async getMyOrders(): Promise<any[]> {
    const response = await this.client.get('/orders/my-orders');
    return response.data;
  }

  async getOrder(orderId: string): Promise<any> {
    const response = await this.client.get(`/orders/${orderId}`);
    return response.data;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<any> {
    const response = await this.client.put(`/orders/${orderId}/status`, { status });
    return response.data;
  }
}

export const api = new ApiService();
