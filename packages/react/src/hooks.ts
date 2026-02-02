import { useContext, useEffect, useCallback, useRef } from 'react';
import { AnalyticsContext, type AnalyticsContextValue } from './context';

/**
 * Hook to access analytics functions
 *
 * @example
 * ```tsx
 * import { useAnalytics } from '@skedox/react';
 *
 * function SignupButton() {
 *   const { track } = useAnalytics();
 *
 *   const handleClick = () => {
 *     track('signup_click', { plan: 'pro' });
 *   };
 *
 *   return <button onClick={handleClick}>Sign Up</button>;
 * }
 * ```
 */
export function useAnalytics(): AnalyticsContextValue {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }

  return context;
}

/**
 * Hook to track pageviews on route changes
 * Automatically tracks when the path changes
 *
 * @example
 * ```tsx
 * import { usePageview } from '@skedox/react';
 * import { useLocation } from 'react-router-dom';
 *
 * function App() {
 *   const location = useLocation();
 *   usePageview(location.pathname);
 *
 *   return <Routes>...</Routes>;
 * }
 * ```
 */
export function usePageview(path?: string): void {
  const context = useContext(AnalyticsContext);
  const previousPath = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!context) return;

    // Track if path changed
    if (path !== previousPath.current) {
      context.trackPageview(path);
      previousPath.current = path;
    }
  }, [context, path]);
}

/**
 * Hook to track an event once on mount
 *
 * @example
 * ```tsx
 * import { useTrackOnce } from '@skedox/react';
 *
 * function PricingPage() {
 *   useTrackOnce('pricing_view', { source: 'header' });
 *
 *   return <div>Pricing content</div>;
 * }
 * ```
 */
export function useTrackOnce(event: string, data?: Record<string, unknown>): void {
  const context = useContext(AnalyticsContext);
  const tracked = useRef(false);

  useEffect(() => {
    if (!context || tracked.current) return;

    context.track(event, data);
    tracked.current = true;
  }, [context, event, data]);
}

/**
 * Hook to create a tracking callback
 * Useful for tracking interactions with stable references
 *
 * @example
 * ```tsx
 * import { useTrackCallback } from '@skedox/react';
 *
 * function ProductCard({ productId }) {
 *   const trackAddToCart = useTrackCallback('add_to_cart', { productId });
 *
 *   return (
 *     <button onClick={trackAddToCart}>
 *       Add to Cart
 *     </button>
 *   );
 * }
 * ```
 */
export function useTrackCallback(event: string, data?: Record<string, unknown>): () => void {
  const context = useContext(AnalyticsContext);

  return useCallback(() => {
    context?.track(event, data);
  }, [context, event, data]);
}

/**
 * Hook to get visitor and session IDs
 *
 * @example
 * ```tsx
 * import { useIdentity } from '@skedox/react';
 *
 * function DebugInfo() {
 *   const { visitorId, sessionId } = useIdentity();
 *
 *   return (
 *     <pre>
 *       Visitor: {visitorId}
 *       Session: {sessionId}
 *     </pre>
 *   );
 * }
 * ```
 */
export function useIdentity(): { visitorId: string | null; sessionId: string | null } {
  const context = useContext(AnalyticsContext);

  return {
    visitorId: context?.getVisitorId() ?? null,
    sessionId: context?.getSessionId() ?? null,
  };
}
