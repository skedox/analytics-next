# Skedox Analytics SDK

Lightweight, privacy-focused web analytics SDK. Track pageviews and custom events with minimal overhead.

## Features

- **Lightweight** - Core library < 2KB gzipped
- **Privacy-first** - No cookies, respects DNT
- **SPA-ready** - Automatic route change detection
- **Offline-capable** - Events queued when offline
- **Framework support** - Vanilla JS, React, and Vue.js

## Packages

| Package                                           | Description                  | Size |
| ------------------------------------------------- | ---------------------------- | ---- |
| [`@skedox/analytics-vanilla`](./packages/vanilla) | Vanilla JavaScript SDK       | ~4KB |
| [`@skedox/analytics-react`](./packages/react)     | React hooks and components   | ~4KB |
| [`@skedox/analytics-vue`](./packages/vue)         | Vue 3 plugin and composables | ~4KB |
| [`@skedox/analytics-core`](./packages/core)       | Core engine (internal)       | ~3KB |

## Quick Start

### Script Tag (Simplest)

```html
<script async src="https://cdn.skedox.com/analytics.js" data-org="org_xxxxxxxxx"></script>
```

### Script Snippet (Advanced)

```html
<script>
  (function (w, d, s, o, f, js, fjs) {
    w['SkedoxAnalytics'] = o;
    w[o] =
      w[o] ||
      function () {
        (w[o].q = w[o].q || []).push(arguments);
      };
    js = d.createElement(s);
    fjs = d.getElementsByTagName(s)[0];
    js.async = 1;
    js.src = f;
    fjs.parentNode.insertBefore(js, fjs);
  })(window, document, 'script', 'ska', 'https://cdn.skedox.com/analytics.js');

  ska('init', 'org_xxxxxxxxx');
  ska('track', 'pageview');
</script>
```

### Vanilla JavaScript (ESM)

```bash
npm install @skedox/analytics-vanilla
```

```javascript
import { init, track, trackPageview } from '@skedox/analytics-vanilla';

// Simple init with orgId
init('org_xxxxxxxxx');

// Or with full config
init({ orgId: 'org_xxxxxxxxx', debug: true });

// Track custom events
track('signup', { plan: 'pro' });

// Manual pageview (for SPAs)
trackPageview('/custom-path');
```

### React

```bash
npm install @skedox/analytics-react
```

```tsx
import { AnalyticsProvider, useAnalytics, usePageview } from '@skedox/analytics-react';
import { useLocation } from 'react-router-dom';

// Wrap your app
function App() {
  return (
    // Simple init with orgId
    <AnalyticsProvider config="org_xxxxxxxxx">
      <Router />
    </AnalyticsProvider>

    // Or with full config
    <AnalyticsProvider config={{ orgId: 'org_xxxxxxxxx', debug: true }}>
      <Router />
    </AnalyticsProvider>
  );
}

// Track pageviews with router
function Router() {
  const location = useLocation();
  usePageview(location.pathname);
  return <Routes>...</Routes>;
}

// Track custom events
function SignupButton() {
  const { track } = useAnalytics();

  return (
    <button onClick={() => track('signup_click', { plan: 'pro' })}>
      Sign Up
    </button>
  );
}
```

### Vue.js

```bash
npm install @skedox/analytics-vue
```

```typescript
// main.ts
import { createApp } from 'vue';
import { SkedoxPlugin } from '@skedox/analytics-vue';

const app = createApp(App);

// Simple init with orgId
app.use(SkedoxPlugin, 'org_xxxxxxxxx');

// Or with full config
app.use(SkedoxPlugin, {
  orgId: 'org_xxxxxxxxx',
  debug: true,
});

app.mount('#app');
```

```vue
<script setup>
import { useAnalytics, usePageview } from '@skedox/analytics-vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const { track } = useAnalytics();

// Auto-track route changes
usePageview(() => route.path);

function handleClick() {
  track('button_click', { button: 'cta' });
}
</script>

<template>
  <button @click="handleClick">Click me</button>

  <!-- Or use the directive -->
  <button v-track="'cta_click'">CTA</button>
</template>
```

## Configuration

```typescript
// Init can be a simple string (orgId)
init('org_xxxxxxxxx');

// Or a full config object
interface AnalyticsConfig {
  // Required
  orgId: string; // Organization ID (e.g., "org_xxxxxxxxx")

  // Optional
  endpoint?: string; // API endpoint (default: https://push.skedox.com)
  debug?: boolean; // Enable console logging (default: false)
  respectDNT?: boolean; // Respect Do Not Track (default: false)
  autoTrack?: boolean; // Auto-track pageviews (default: true)
  spa?: boolean; // Enable SPA mode (default: true)
  batchSize?: number; // Max events per batch (default: 10)
  flushInterval?: number; // Flush interval in ms (default: 5000)
}
```

## API Reference

### Core Methods

| Method                          | Description                 |
| ------------------------------- | --------------------------- |
| `init(orgId)` or `init(config)` | Initialize the tracker      |
| `track(event, data?)`           | Track a custom event        |
| `trackPageview(path?)`          | Track a pageview            |
| `flush()`                       | Flush pending events        |
| `getVisitorId()`                | Get persistent visitor ID   |
| `getSessionId()`                | Get session ID              |
| `optOut()`                      | Opt out of tracking         |
| `optIn()`                       | Opt in to tracking          |
| `isEnabled()`                   | Check if tracking is active |
| `destroy()`                     | Clean up tracker            |

### React Hooks

| Hook                             | Description                    |
| -------------------------------- | ------------------------------ |
| `useAnalytics()`                 | Access track methods           |
| `usePageview(path)`              | Track pageviews on path change |
| `useTrackOnce(event, data?)`     | Track event once on mount      |
| `useTrackCallback(event, data?)` | Get stable tracking callback   |
| `useIdentity()`                  | Get visitor/session IDs        |

### Vue Composables

| Composable                            | Description                    |
| ------------------------------------- | ------------------------------ |
| `useAnalytics()`                      | Access track methods           |
| `usePageview(path)`                   | Track pageviews on path change |
| `useTrackOnce(event, data?)`          | Track event once on mount      |
| `useTrackCallback(event)`             | Get tracking function          |
| `useIdentity()`                       | Get visitor/session IDs        |
| `useTrackVisibility(event, options?)` | Track element visibility       |

## Data Collected

**Client-side payload:**

```json
{
  "s": "org_xxxxxxxxx",
  "t": "pageview",
  "p": "/about",
  "r": "https://google.com",
  "v": "visitor-uuid",
  "sid": "session-uuid",
  "d": { "custom": "data" }
}
```

| Field | Description                     | Required               |
| ----- | ------------------------------- | ---------------------- |
| `s`   | Organization ID                 | Yes                    |
| `t`   | Event type (pageview or custom) | No (default: pageview) |
| `p`   | URL path                        | No                     |
| `r`   | Referrer                        | No                     |
| `v`   | Visitor ID (fingerprint)        | Yes                    |
| `sid` | Session ID                      | No                     |
| `d`   | Custom data (object)            | No                     |

**Server-side enrichment:**

- `country` - ISO country code (from IP)
- `device` - desktop/mobile/tablet
- `browser` - Chrome, Firefox, Safari...
- `os` - Windows, macOS, iOS, Android...

## Privacy

- **No cookies** - Uses localStorage/sessionStorage
- **No fingerprinting** - Simple UUID-based identification
- **DNT support** - Optional Do Not Track respect
- **Opt-out** - Users can opt out anytime
- **Minimal data** - Only essential metrics collected

## Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Build specific package
npm run build:core
npm run build:vanilla
npm run build:react
npm run build:vue

# Type check
npm run typecheck
```

## License

MIT
