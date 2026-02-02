import { createContext } from 'react';
import type { Analytics } from '@skedox/core';

export interface AnalyticsContextValue {
  /** Track a custom event */
  track: (event: string, data?: Record<string, unknown>) => void;
  /** Track a pageview */
  trackPageview: (path?: string) => void;
  /** Get visitor ID */
  getVisitorId: () => string | null;
  /** Get session ID */
  getSessionId: () => string | null;
  /** Opt out of tracking */
  optOut: () => void;
  /** Opt in to tracking */
  optIn: () => void;
  /** Check if tracking is enabled */
  isEnabled: () => boolean;
  /** Internal tracker instance */
  _tracker: Analytics | null;
}

export const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);
