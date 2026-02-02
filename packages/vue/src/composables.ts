import { inject, watch, onMounted, onUnmounted, ref, type Ref } from 'vue';
import { ANALYTICS_KEY } from './plugin';
import type { Analytics } from '@skedox/core';

/**
 * Composable to access analytics functions
 *
 * @example
 * ```vue
 * <script setup>
 * import { useAnalytics } from '@skedox/vue';
 *
 * const { track } = useAnalytics();
 *
 * function handleSignup() {
 *   track('signup_click', { plan: 'pro' });
 * }
 * </script>
 * ```
 */
export function useAnalytics(): Analytics {
  const analytics = inject(ANALYTICS_KEY);

  if (!analytics) {
    throw new Error('useAnalytics must be used within an app that has SkedoxPlugin installed');
  }

  return analytics;
}

/**
 * Composable to track pageviews on route changes
 *
 * @example
 * ```vue
 * <script setup>
 * import { useRoute } from 'vue-router';
 * import { usePageview } from '@skedox/vue';
 *
 * const route = useRoute();
 * usePageview(() => route.path);
 * </script>
 * ```
 */
export function usePageview(path?: Ref<string> | (() => string)): void {
  const analytics = inject(ANALYTICS_KEY);
  if (!analytics) return;

  const getPath = typeof path === 'function' ? path : () => path?.value;
  let previousPath: string | undefined;

  // Track on mount
  onMounted(() => {
    const currentPath = getPath();
    if (currentPath !== previousPath) {
      analytics.trackPageview(currentPath);
      previousPath = currentPath;
    }
  });

  // Watch for path changes
  if (path) {
    const source = typeof path === 'function' ? path : path;
    watch(source, (newPath) => {
      if (newPath !== previousPath) {
        analytics.trackPageview(newPath);
        previousPath = newPath;
      }
    });
  }
}

/**
 * Composable to track an event once on mount
 *
 * @example
 * ```vue
 * <script setup>
 * import { useTrackOnce } from '@skedox/vue';
 *
 * useTrackOnce('pricing_view', { source: 'header' });
 * </script>
 * ```
 */
export function useTrackOnce(event: string, data?: Record<string, unknown>): void {
  const analytics = inject(ANALYTICS_KEY);
  if (!analytics) return;

  onMounted(() => {
    analytics.track(event, data);
  });
}

/**
 * Composable to create a tracking function
 *
 * @example
 * ```vue
 * <script setup>
 * import { useTrackCallback } from '@skedox/vue';
 *
 * const trackAddToCart = useTrackCallback('add_to_cart');
 * </script>
 *
 * <template>
 *   <button @click="trackAddToCart({ productId: 123 })">
 *     Add to Cart
 *   </button>
 * </template>
 * ```
 */
export function useTrackCallback(event: string): (data?: Record<string, unknown>) => void {
  const analytics = inject(ANALYTICS_KEY);

  return (data?: Record<string, unknown>) => {
    analytics?.track(event, data);
  };
}

/**
 * Composable to get visitor and session IDs
 *
 * @example
 * ```vue
 * <script setup>
 * import { useIdentity } from '@skedox/vue';
 *
 * const { visitorId, sessionId } = useIdentity();
 * </script>
 * ```
 */
export function useIdentity(): { visitorId: Ref<string | null>; sessionId: Ref<string | null> } {
  const analytics = inject(ANALYTICS_KEY);

  const visitorId = ref<string | null>(analytics?.getVisitorId() ?? null);
  const sessionId = ref<string | null>(analytics?.getSessionId() ?? null);

  return { visitorId, sessionId };
}

/**
 * Composable to track element visibility
 *
 * @example
 * ```vue
 * <script setup>
 * import { useTrackVisibility } from '@skedox/vue';
 *
 * const { elementRef } = useTrackVisibility('section_view', {
 *   section: 'pricing',
 *   threshold: 0.8,
 * });
 * </script>
 *
 * <template>
 *   <section ref="elementRef">
 *     Pricing content
 *   </section>
 * </template>
 * ```
 */
export function useTrackVisibility(
  event: string,
  options?: {
    data?: Record<string, unknown>;
    once?: boolean;
    threshold?: number;
  }
): { elementRef: Ref<HTMLElement | null> } {
  const analytics = inject(ANALYTICS_KEY);
  const elementRef = ref<HTMLElement | null>(null);

  const { data, once = true, threshold = 0.5 } = options || {};

  let observer: IntersectionObserver | null = null;
  let hasTracked = false;

  onMounted(() => {
    if (!elementRef.value || !analytics || typeof IntersectionObserver === 'undefined') {
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && (!once || !hasTracked)) {
            analytics.track(event, data);
            hasTracked = true;
            if (once && observer) {
              observer.disconnect();
            }
          }
        });
      },
      { threshold }
    );

    observer.observe(elementRef.value);
  });

  onUnmounted(() => {
    observer?.disconnect();
  });

  return { elementRef };
}
