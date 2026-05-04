import { authApi } from '../api/auth.api';
import { usersApi } from '../api/users.api';
import { listingsApi } from '../api/listings.api';
import { messagesApi } from '../api/messages.api';
import { ordersApi } from '../api/orders.api';

/**
 * Point d'entrée rétrocompatible pour les pages existantes.
 * Les nouveaux modules se trouvent dans src/api/.
 */
export const api = {
  register: authApi.register,
  login: authApi.login,
  logout: authApi.logout,

  getCurrentUser: usersApi.getCurrentUser,
  updateProfile: usersApi.updateProfile,

  getCategories: listingsApi.getCategories,
  getProducts: listingsApi.getProducts,
  getListings: listingsApi.getAll,
  getListing: listingsApi.getById,
  createListing: listingsApi.create,
  updateListing: listingsApi.update,
  deleteListing: listingsApi.delete,
  getMyListings: listingsApi.getMyListings,

  getConversations: messagesApi.getConversations,
  getConversation: messagesApi.getMessages,
  sendMessage: messagesApi.sendMessage,
  createConversation: messagesApi.createConversation,

  createOrder: ordersApi.create,
  getMyOrders: ordersApi.getMyOrders,
  getOrder: ordersApi.getById,
  updateOrderStatus: ordersApi.updateStatus,
};
