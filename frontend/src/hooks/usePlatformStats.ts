import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/api/config';

export interface PlatformStats {
  users: number;
  listings: number;
  regions: number;
  posts: number;
}

export function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/analytics/platform-stats`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.users === 'number') {
          setStats(data as PlatformStats);
        }
      })
      .catch(() => {
        /* keep null — UI falls back to dashes */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
}
