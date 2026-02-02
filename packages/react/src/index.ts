// Provider
export { AnalyticsProvider, type AnalyticsProviderProps } from './provider';

// Context
export { AnalyticsContext, type AnalyticsContextValue } from './context';

// Hooks
export { useAnalytics, usePageview, useTrackOnce, useTrackCallback, useIdentity } from './hooks';

// Components
export {
  TrackClick,
  TrackVisibility,
  type TrackClickProps,
  type TrackVisibilityProps,
} from './components';

// Re-export core types
export type { AnalyticsConfig, InitParam, Analytics } from '@skedox/core';
