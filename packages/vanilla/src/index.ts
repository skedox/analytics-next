import { createTracker, type InitParam } from '@skedox/analytics-core';

// Create singleton instance
const tracker = createTracker();

// Queue for calls made before init
const queue: Array<{ method: string; args: unknown[] }> = [];
let isInitialized = false;

/**
 * Process queued calls after initialization
 */
function processQueue(): void {
  while (queue.length > 0) {
    const call = queue.shift();
    if (call) {
      const method = call.method as keyof typeof skedox;
      const fn = skedox[method];
      if (typeof fn === 'function') {
        (fn as (...args: unknown[]) => unknown).apply(null, call.args);
      }
    }
  }
}

/**
 * Initialize the analytics tracker
 * @param config - Organization ID string or config object
 * @example
 * // Simple init with orgId
 * init('org_xxxxxxxxx');
 *
 * // Full config
 * init({ orgId: 'org_xxxxxxxxx', debug: true });
 */
export function init(config: InitParam): void {
  tracker.init(config);
  isInitialized = true;
  processQueue();
}

/**
 * Track a pageview
 */
export function trackPageview(path?: string): void {
  if (!isInitialized) {
    queue.push({ method: 'trackPageview', args: [path] });
    return;
  }
  tracker.trackPageview(path);
}

/**
 * Track a custom event
 */
export function track(event: string, data?: Record<string, unknown>): void {
  if (!isInitialized) {
    queue.push({ method: 'track', args: [event, data] });
    return;
  }
  tracker.track(event, data);
}

/**
 * Flush pending events
 */
export function flush(): Promise<void> {
  return tracker.flush();
}

/**
 * Get visitor ID
 */
export function getVisitorId(): string | null {
  return tracker.getVisitorId();
}

/**
 * Get session ID
 */
export function getSessionId(): string | null {
  return tracker.getSessionId();
}

/**
 * Opt out of tracking
 */
export function optOut(): void {
  tracker.optOut();
}

/**
 * Opt in to tracking
 */
export function optIn(): void {
  tracker.optIn();
}

/**
 * Check if tracking is enabled
 */
export function isEnabled(): boolean {
  return tracker.isEnabled();
}

/**
 * Destroy the tracker
 */
export function destroy(): void {
  tracker.destroy();
  isInitialized = false;
}

// Public API object
const skedox = {
  init,
  track,
  trackPageview,
  flush,
  getVisitorId,
  getSessionId,
  optOut,
  optIn,
  isEnabled,
  destroy,
  // Queue for pre-init calls (populated by snippet)
  q: [] as Array<[string, ...unknown[]]>,
};

/**
 * Auto-detect org ID from script tag and initialize
 * Only runs when included via script tag with data-org attribute
 */
function autoInit(): void {
  if (typeof document === 'undefined') return;

  // Find script tag with data-org
  const scripts = document.querySelectorAll('script[data-org]');
  let orgId: string | null = null;
  let scriptEl: Element | null = null;

  // Check currentScript first (most reliable)
  if (document.currentScript?.getAttribute('data-org')) {
    orgId = document.currentScript.getAttribute('data-org');
    scriptEl = document.currentScript;
  }

  // Fallback to querying
  if (!orgId) {
    for (const script of scripts) {
      const id = script.getAttribute('data-org');
      if (id) {
        orgId = id;
        scriptEl = script;
        break;
      }
    }
  }

  if (orgId && scriptEl) {
    // Get optional config from data attributes
    const debug = scriptEl.getAttribute('data-debug') === 'true';
    const respectDNT = scriptEl.getAttribute('data-respect-dnt') !== 'false';
    const autoTrack = scriptEl.getAttribute('data-auto-track') !== 'false';
    const spa = scriptEl.getAttribute('data-spa') !== 'false';

    init({
      orgId,
      debug,
      respectDNT,
      autoTrack,
      spa,
    });
  }

  // Process any calls from the snippet queue
  const snippetQueue = skedox.q;
  while (snippetQueue.length > 0) {
    const call = snippetQueue.shift();
    if (call) {
      const [method, ...args] = call;
      const fn = skedox[method as keyof typeof skedox];
      if (typeof fn === 'function') {
        (fn as (...a: unknown[]) => unknown)(...args);
      }
    }
  }
}

// Augment Window type
declare global {
  interface Window {
    skedox: typeof skedox;
    ska: typeof skedox; // Alias for snippet
  }
}

// Attach to window for script tag usage
if (typeof window !== 'undefined') {
  // Preserve any existing queue from snippet
  const existingQueue = window.skedox?.q || window.ska?.q || [];

  window.skedox = skedox;
  window.ska = skedox; // Alias for shorter snippet usage

  // Restore queue
  if (existingQueue.length > 0) {
    skedox.q.push(...existingQueue);
  }

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
}

// Re-export types
export type { AnalyticsConfig, InitParam, Analytics } from '@skedox/analytics-core';

// Default export
export default skedox;
