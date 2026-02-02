// Plugin
export { SkedoxPlugin, ANALYTICS_KEY, type SkedoxPluginOptions, type SkedoxPluginInit } from './plugin';

// Composables
export {
  useAnalytics,
  usePageview,
  useTrackOnce,
  useTrackCallback,
  useIdentity,
  useTrackVisibility,
} from './composables';

// Re-export core types
export type { AnalyticsConfig, InitParam, Analytics } from '@skedox/core';
