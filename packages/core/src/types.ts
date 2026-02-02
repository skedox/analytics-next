/**
 * Configuration options for the analytics SDK
 */
export interface AnalyticsConfig {
  /** Organization ID (e.g., "org_xxxxxxxxx") */
  orgId: string;
  /** API endpoint for sending events (default: https://push.skedox.com) */
  endpoint?: string;
  /** Enable debug mode for console logging */
  debug?: boolean;
  /** Respect Do Not Track browser setting */
  respectDNT?: boolean;
  /** Auto-track pageviews on init */
  autoTrack?: boolean;
  /** Enable SPA route change detection */
  spa?: boolean;
  /** Maximum events per batch */
  batchSize?: number;
  /** Flush interval in milliseconds */
  flushInterval?: number;
}

/**
 * Init parameter - can be orgId string or full config object
 */
export type InitParam = string | AnalyticsConfig;

/**
 * Internal resolved configuration with defaults applied
 */
export interface ResolvedConfig {
  orgId: string;
  endpoint: string;
  debug: boolean;
  respectDNT: boolean;
  autoTrack: boolean;
  spa: boolean;
  batchSize: number;
  flushInterval: number;
}

/**
 * Event payload sent to the server
 */
export interface AnalyticsEvent {
  /** Organization ID */
  s: string;
  /** Event type (pageview, custom event name) */
  t: string;
  /** Page path */
  p: string;
  /** Document referrer */
  r: string;
  /** Visitor ID (persistent) */
  v: string;
  /** Session ID (tab-scoped) */
  sid: string;
  /** Custom event data */
  d?: Record<string, unknown>;
}

/**
 * Batch payload for multiple events
 */
export interface BatchPayload {
  events: AnalyticsEvent[];
}

/**
 * Public API interface
 */
export interface Analytics {
  /** Initialize the tracker with orgId string or config object */
  init(config: InitParam): void;
  /** Track a pageview */
  trackPageview(path?: string): void;
  /** Track a custom event */
  track(event: string, data?: Record<string, unknown>): void;
  /** Flush pending events immediately */
  flush(): Promise<void>;
  /** Get current visitor ID */
  getVisitorId(): string | null;
  /** Get current session ID */
  getSessionId(): string | null;
  /** Opt out of tracking */
  optOut(): void;
  /** Opt in to tracking */
  optIn(): void;
  /** Check if tracking is enabled */
  isEnabled(): boolean;
  /** Destroy the tracker and clean up */
  destroy(): void;
}
