const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '');
const fallbackApiUrl = 'https://backend-khaki-three-10.vercel.app/api';

export const API_BASE_URL = configuredApiUrl
  ? configuredApiUrl.endsWith('/api')
    ? configuredApiUrl
    : `${configuredApiUrl}/api`
  : fallbackApiUrl;
