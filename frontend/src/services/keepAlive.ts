/**
 * keepAlive.ts
 * ─────────────────────────────────────────────────────────────
 * Legacy warm-up helper for older always-on deployments.
 * Do not start this for Vercel functions: periodic pings only add invocations.
 *
 * Strategy:
 *   1. On app start → warm up the backend immediately.
 *   2. Every 10 minutes → silently ping /api/health when explicitly started.
 *
 * The Vercel application entrypoint intentionally does not start this service.
 * ─────────────────────────────────────────────────────────────
 */
import { API_BASE_URL } from '@/api/config';

const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
// Strip trailing /api to get the root URL for the health check
const HEALTH_URL = API_BASE_URL.replace(/\/api\/?$/, '') + '/api/health';

class KeepAliveService {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;

  /** Ping the health endpoint once. Silently ignores failures. */
  private async ping(): Promise<void> {
    try {
      const res = await fetch(HEALTH_URL, {
        method: 'GET',
        cache: 'no-store',
        signal: AbortSignal.timeout(15_000), // 15 s timeout for cold starts
      });
      if (import.meta.env.DEV) {
        console.debug(`[KeepAlive] ✅ Ping OK — ${res.status}`);
      }
    } catch (err) {
      // Non-fatal: log a soft warning in dev, stay silent in prod
      if (import.meta.env.DEV) {
        console.warn('[KeepAlive] ⚠️ Ping failed:', err);
      }
    }
  }

  /**
   * Start the keep-alive loop.
   * Safe to call multiple times — only one loop will run.
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Optional warm-up for deployments that need it.
    this.ping();

    // Schedule recurring pings
    this.intervalId = setInterval(() => {
      this.ping();
    }, PING_INTERVAL_MS);

    if (import.meta.env.DEV) {
      console.info(
        `[KeepAlive] 🚀 Started — pinging ${HEALTH_URL} every ${PING_INTERVAL_MS / 60_000} min`
      );
    }
  }

  /** Stop the keep-alive loop (e.g., when the user logs out or tab closes). */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }
}

export const keepAlive = new KeepAliveService();
