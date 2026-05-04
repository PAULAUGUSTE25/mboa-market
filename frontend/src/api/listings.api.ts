import httpClient from './client';
import type {
  Listing,
  ListingCreateRequest,
  ListingUpdateRequest,
  Category,
  Product,
  PaginatedListings,
  ListingFilters,
} from '../types/listing.types';

export const listingsApi = {
  getAll: async (filters?: ListingFilters): Promise<PaginatedListings> => {
    const response = await httpClient.get('/listings', { params: filters });
    return response.data;
  },

  getById: async (id: string): Promise<Listing> => {
    const response = await httpClient.get(`/listings/${id}`);
    return response.data;
  },

  getMyListings: async (): Promise<Listing[]> => {
    const response = await httpClient.get('/listings/my/listings');
    return response.data;
  },

  create: async (data: ListingCreateRequest): Promise<Listing> => {
    const response = await httpClient.post('/listings', data);
    return response.data;
  },

  update: async (id: string, data: ListingUpdateRequest): Promise<Listing> => {
    const response = await httpClient.put(`/listings/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`/listings/${id}`);
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await httpClient.get('/listings/categories/all');
    return response.data;
  },

  getProducts: async (): Promise<Product[]> => {
    const response = await httpClient.get('/listings/products/all');
    return response.data;
  },
};
