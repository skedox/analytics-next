import type { App, InjectionKey } from 'vue';
import { createTracker, type AnalyticsConfig, type Analytics, type InitParam } from '@skedox/core';

export const ANALYTICS_KEY: InjectionKey<Analytics> = Symbol('skedox-analytics');

export interface SkedoxPluginOptions extends AnalyticsConfig {
  /** Register v-track directive (default: true) */
  directive?: boolean;
}

/** Plugin options can be orgId string or full config */
export type SkedoxPluginInit = string | SkedoxPluginOptions;

/**
 * Vue plugin to install Skedox Analytics
 *
 * @example
 * ```ts
 * import { createApp } from 'vue';
 * import { SkedoxPlugin } from '@skedox/vue';
 *
 * const app = createApp(App);
 *
 * // Simple init with orgId
 * app.use(SkedoxPlugin, 'org_xxxxxxxxx');
 *
 * // Or with full config
 * app.use(SkedoxPlugin, {
 *   orgId: 'org_xxxxxxxxx',
 *   debug: true,
 * });
 *
 * app.mount('#app');
 * ```
 */
export const SkedoxPlugin = {
  install(app: App, options: SkedoxPluginInit): void {
    const tracker = createTracker();
    tracker.init(options as InitParam);

    // Provide tracker for composables
    app.provide(ANALYTICS_KEY, tracker);

    // Register global $skedox property
    app.config.globalProperties.$skedox = tracker;

    // Get directive option (default true)
    const enableDirective = typeof options === 'string' || options.directive !== false;

    // Register v-track directive
    if (enableDirective) {
      app.directive('track', {
        mounted(el: HTMLElement, binding) {
          const handler = () => {
            const event = binding.arg || 'click';
            const data = typeof binding.value === 'object' ? binding.value : undefined;
            const eventName = typeof binding.value === 'string' ? binding.value : event;

            tracker.track(eventName, data);
          };

          el.addEventListener('click', handler);
          (el as HTMLElement & { _skedoxHandler?: () => void })._skedoxHandler = handler;
        },
        unmounted(el: HTMLElement) {
          const handler = (el as HTMLElement & { _skedoxHandler?: () => void })._skedoxHandler;
          if (handler) {
            el.removeEventListener('click', handler);
          }
        },
      });
    }

    // Clean up on app unmount
    app.config.globalProperties.$skedoxDestroy = () => {
      tracker.destroy();
    };
  },
};

// Augment Vue types
declare module 'vue' {
  interface ComponentCustomProperties {
    $skedox: Analytics;
    $skedoxDestroy: () => void;
  }
}
