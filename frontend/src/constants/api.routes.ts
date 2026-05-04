export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  USERS: {
    ME: '/users/me',
    ME_PROFILE: '/users/me/profile',
  },
  LISTINGS: {
    BASE: '/listings',
    BY_ID: (id: string) => `/listings/${id}`,
    MY_LISTINGS: '/listings/my/listings',
    CATEGORIES: '/listings/categories/all',
    PRODUCTS: '/listings/products/all',
  },
  MESSAGES: {
    CONVERSATIONS: '/messages/conversations',
    CONVERSATION_MESSAGES: (id: string) => `/messages/conversations/${id}/messages`,
  },
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
    MY_ORDERS: '/orders/my-orders',
    STATUS: (id: string) => `/orders/${id}/status`,
  },
} as const;
