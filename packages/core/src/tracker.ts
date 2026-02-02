import type {
  AnalyticsConfig,
  ResolvedConfig,
  AnalyticsEvent,
  Analytics,
  InitParam,
} from './types';
import { getVisitorId, getSessionId, isOptedOut, setOptOut } from './storage';
import { createTransport } from './transport';
import { createQueue, type Queue } from './queue';

const DEFAULT_ENDPOINT = 'https://push.skedox.com';
const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_FLUSH_INTERVAL = 5000;

/**
 * Normalize init parameter to config object
 */
function normalizeConfig(param: InitParam): AnalyticsConfig {
  if (typeof param === 'string') {
    return { orgId: param };
  }
  return param;
}

/**
 * Resolve configuration with defaults
 */
function resolveConfig(config: AnalyticsConfig): ResolvedConfig {
  return {
    orgId: config.orgId,
    endpoint: config.endpoint ?? DEFAULT_ENDPOINT,
    debug: config.debug ?? false,
    respectDNT: config.respectDNT ?? false,
    autoTrack: config.autoTrack ?? true,
    spa: config.spa ?? true,
    batchSize: config.batchSize ?? DEFAULT_BATCH_SIZE,
    flushInterval: config.flushInterval ?? DEFAULT_FLUSH_INTERVAL,
  };
}

/**
 * Check if Do Not Track is enabled
 */
function isDNTEnabled(): boolean {
  if (typeof navigator === 'undefined') return false;
  const dnt = navigator.doNotTrack || (window as { doNotTrack?: string }).doNotTrack;
  return dnt === '1' || dnt === 'yes';
}

/**
 * Debounce function to prevent rapid duplicate calls
 */
function debounce(fn: (path?: string) => void, wait: number): (path?: string) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (path?: string) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(path), wait);
  };
}

/**
 * Create a tracker instance
 */
export function createTracker(): Analytics {
  let config: ResolvedConfig | null = null;
  let queue: Queue | null = null;
  let initialized = false;
  let enabled = true;
  let lastPath = '';

  // Store original history methods for cleanup
  let originalPushState: typeof history.pushState | null = null;
  let originalReplaceState: typeof history.replaceState | null = null;
  let popstateHandler: (() => void) | null = null;

  const log = (...args: unknown[]) => {
    if (config?.debug) {
      console.log('[skedox]', ...args);
    }
  };

  /**
   * Create an event payload
   */
  function createEvent(
    type: string,
    path?: string,
    data?: Record<string, unknown>
  ): AnalyticsEvent {
    return {
      s: config!.orgId,
      t: type,
      p: path ?? (typeof location !== 'undefined' ? location.pathname : '/'),
      r: typeof document !== 'undefined' ? document.referrer : '',
      v: getVisitorId() ?? '',
      sid: getSessionId() ?? '',
      d: data,
    };
  }

  /**
   * Track a pageview (internal, debounced)
   */
  const trackPageviewInternal = debounce((path?: string) => {
    if (!initialized || !enabled || !config) return;

    const currentPath = path ?? (typeof location !== 'undefined' ? location.pathname : '/');

    // Prevent duplicate pageviews for same path
    if (currentPath === lastPath) {
      log('Skipping duplicate pageview:', currentPath);
      return;
    }
    lastPath = currentPath;

    const event = createEvent('pageview', currentPath);
    queue?.push(event);
    log('Pageview tracked:', currentPath);
  }, 100);

  /**
   * Set up SPA route change detection
   */
  function setupSPATracking(): void {
    if (typeof window === 'undefined' || typeof history === 'undefined') return;

    // Intercept pushState
    originalPushState = history.pushState;
    history.pushState = function (...args) {
      originalPushState!.apply(this, args);
      trackPageviewInternal();
    };

    // Intercept replaceState
    originalReplaceState = history.replaceState;
    history.replaceState = function (...args) {
      originalReplaceState!.apply(this, args);
      trackPageviewInternal();
    };

    // Listen for popstate (browser back/forward)
    popstateHandler = () => trackPageviewInternal();
    window.addEventListener('popstate', popstateHandler);

    log('SPA tracking enabled');
  }

  /**
   * Clean up SPA tracking
   */
  function cleanupSPATracking(): void {
    if (originalPushState) {
      history.pushState = originalPushState;
      originalPushState = null;
    }
    if (originalReplaceState) {
      history.replaceState = originalReplaceState;
      originalReplaceState = null;
    }
    if (popstateHandler && typeof window !== 'undefined') {
      window.removeEventListener('popstate', popstateHandler);
      popstateHandler = null;
    }
  }

  return {
    init(param: InitParam): void {
      if (initialized) {
        log('Already initialized');
        return;
      }

      const userConfig = normalizeConfig(param);

      if (!userConfig.orgId) {
        console.error('[skedox] orgId is required');
        return;
      }

      config = resolveConfig(userConfig);

      // Check DNT
      if (config.respectDNT && isDNTEnabled()) {
        log('DNT enabled, tracking disabled');
        enabled = false;
        initialized = true;
        return;
      }

      // Check opt-out
      if (isOptedOut()) {
        log('User opted out, tracking disabled');
        enabled = false;
        initialized = true;
        return;
      }

      // Create transport and queue
      const transport = createTransport(config.endpoint, config.debug);
      queue = createQueue({
        batchSize: config.batchSize,
        flushInterval: config.flushInterval,
        transport,
        debug: config.debug,
      });

      initialized = true;
      log('Initialized with orgId:', config.orgId);

      // Set up SPA tracking
      if (config.spa) {
        setupSPATracking();
      }

      // Auto-track initial pageview
      if (config.autoTrack) {
        trackPageviewInternal();
      }
    },

    trackPageview(path?: string): void {
      if (!initialized || !enabled) return;
      lastPath = ''; // Reset to allow manual tracking
      trackPageviewInternal(path);
    },

    track(event: string, data?: Record<string, unknown>): void {
      if (!initialized || !enabled || !config) return;

      const payload = createEvent(event, undefined, data);
      queue?.push(payload);
      log('Event tracked:', event, data);
    },

    async flush(): Promise<void> {
      if (!initialized || !queue) return;
      await queue.flush();
    },

    getVisitorId(): string | null {
      return getVisitorId();
    },

    getSessionId(): string | null {
      return getSessionId();
    },

    optOut(): void {
      setOptOut(true);
      enabled = false;
      log('Opted out of tracking');
    },

    optIn(): void {
      setOptOut(false);
      enabled = true;
      log('Opted in to tracking');
    },

    isEnabled(): boolean {
      return enabled && initialized;
    },

    destroy(): void {
      cleanupSPATracking();
      queue?.destroy();
      queue = null;
      config = null;
      initialized = false;
      enabled = true;
      lastPath = '';
      log('Tracker destroyed');
    },
  };
}
