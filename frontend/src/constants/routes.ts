export const ROUTES = {
  HOME: '/',
  FEED: '/feed',
  LOGIN: '/login',
  REGISTER: '/register',
  SELECT_SECTOR: '/select-sector',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  MY_ACTIVITY: '/my-activity',
  CHAT: '/chat',
  LISTINGS: '/listings',
  LISTING_DETAIL: '/listings/:id',
  EXPERTS: '/experts',
  TIPS: '/tips',
  COMMUNITY_AGRICULTURE: '/community/agriculture',
  COMMUNITY_ELEVAGE: '/community/elevage',
  PRIVACY: '/privacy',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];
