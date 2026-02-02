import { type ReactNode, type MouseEvent, type ReactElement, cloneElement, isValidElement, Children, useCallback } from 'react';
import { useAnalytics } from './hooks';

export interface TrackClickProps {
  /** Event name to track */
  event: string;
  /** Additional event data */
  data?: Record<string, unknown>;
  /** Child element (must accept onClick) */
  children: ReactElement<{ onClick?: (e: MouseEvent) => void }>;
}

/**
 * Component to track click events on child elements
 *
 * @example
 * ```tsx
 * import { TrackClick } from '@skedox/react';
 *
 * function Hero() {
 *   return (
 *     <TrackClick event="cta_click" data={{ location: 'hero' }}>
 *       <button>Get Started</button>
 *     </TrackClick>
 *   );
 * }
 * ```
 */
export function TrackClick({ event, data, children }: TrackClickProps): ReactNode {
  const { track } = useAnalytics();

  const handleClick = useCallback(
    (originalHandler?: (e: MouseEvent) => void) => (e: MouseEvent) => {
      track(event, data);
      originalHandler?.(e);
    },
    [track, event, data]
  );

  const child = Children.only(children);

  if (!isValidElement(child)) {
    return child;
  }

  return cloneElement(child, {
    onClick: handleClick(child.props.onClick),
  });
}

export interface TrackVisibilityProps {
  /** Event name to track when visible */
  event: string;
  /** Additional event data */
  data?: Record<string, unknown>;
  /** Track only once (default: true) */
  once?: boolean;
  /** Intersection threshold (0-1, default: 0.5) */
  threshold?: number;
  /** Child elements */
  children: ReactNode;
  /** Wrapper element class name */
  className?: string;
}

/**
 * Component to track when an element becomes visible
 *
 * @example
 * ```tsx
 * import { TrackVisibility } from '@skedox/react';
 *
 * function PricingSection() {
 *   return (
 *     <TrackVisibility event="pricing_view" threshold={0.8}>
 *       <section>
 *         <h2>Pricing</h2>
 *         ...
 *       </section>
 *     </TrackVisibility>
 *   );
 * }
 * ```
 */
export function TrackVisibility({
  event,
  data,
  once = true,
  threshold = 0.5,
  children,
  className,
}: TrackVisibilityProps): ReactNode {
  const { track } = useAnalytics();

  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || typeof IntersectionObserver === 'undefined') return;

      let hasTracked = false;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && (!once || !hasTracked)) {
              track(event, data);
              hasTracked = true;
              if (once) {
                observer.disconnect();
              }
            }
          });
        },
        { threshold }
      );

      observer.observe(node);

      return () => observer.disconnect();
    },
    [track, event, data, once, threshold]
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
