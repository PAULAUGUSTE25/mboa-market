/**
 * keepAlive.ts
 * ─────────────────────────────────────────────────────────────
 * Prevents the Render free-tier backend from spinning down due
 * to inactivity (Render kills free services after 15 minutes).
 *
 * Strategy:
 *   1. On app start → warm up the backend immediately.
 *   2. Every 10 minutes → silently ping /api/health.
 *
 * The service is a singleton; call `keepAlive.start()` once in
 * main.tsx / App.tsx and it handles everything automatically.
 * ─────────────────────────────────────────────────────────────
 */

const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
// Strip trailing /api to get the root URL for the health check
const HEALTH_URL = BASE_URL.replace(/\/api\/?$/, '') + '/api/health';

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

    // Warm-up: ping immediately so the backend is hot when the user lands
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
