import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { createTracker, type InitParam } from '@skedox/core';
import { AnalyticsContext, type AnalyticsContextValue } from './context';

export interface AnalyticsProviderProps {
  /** Analytics configuration - orgId string or config object */
  config: InitParam;
  /** Child components */
  children: ReactNode;
}

/**
 * Provider component that initializes the analytics tracker
 *
 * @example
 * ```tsx
 * import { AnalyticsProvider } from '@skedox/react';
 *
 * function App() {
 *   return (
 *     // Simple init with orgId
 *     <AnalyticsProvider config="org_xxxxxxxxx">
 *       <YourApp />
 *     </AnalyticsProvider>
 *
 *     // Or with full config
 *     <AnalyticsProvider config={{ orgId: 'org_xxxxxxxxx', debug: true }}>
 *       <YourApp />
 *     </AnalyticsProvider>
 *   );
 * }
 * ```
 */
export function AnalyticsProvider({ config, children }: AnalyticsProviderProps): ReactNode {
  const trackerRef = useRef(createTracker());

  // Get orgId for dependency tracking
  const orgId = typeof config === 'string' ? config : config.orgId;

  // Initialize tracker on mount
  useEffect(() => {
    const tracker = trackerRef.current;
    tracker.init(config);

    return () => {
      tracker.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]); // Re-init only if orgId changes, config object reference may change

  const value = useMemo<AnalyticsContextValue>(
    () => ({
      track: (event: string, data?: Record<string, unknown>) =>
        trackerRef.current.track(event, data),
      trackPageview: (path?: string) => trackerRef.current.trackPageview(path),
      getVisitorId: () => trackerRef.current.getVisitorId(),
      getSessionId: () => trackerRef.current.getSessionId(),
      optOut: () => trackerRef.current.optOut(),
      optIn: () => trackerRef.current.optIn(),
      isEnabled: () => trackerRef.current.isEnabled(),
      _tracker: trackerRef.current,
    }),
    []
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}
