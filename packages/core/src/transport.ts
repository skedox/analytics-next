import type { AnalyticsEvent, BatchPayload } from './types';

export type TransportMethod = 'beacon' | 'fetch' | 'xhr';

/**
 * Send data using navigator.sendBeacon (preferred)
 */
function sendBeacon(url: string, data: string): boolean {
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try {
      return navigator.sendBeacon(url, data);
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Send data using fetch with keepalive
 */
async function sendFetch(url: string, data: string): Promise<boolean> {
  if (typeof fetch !== 'undefined') {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
        keepalive: true,
      });
      return response.ok;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Send data using XMLHttpRequest (fallback)
 */
function sendXHR(url: string, data: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof XMLHttpRequest !== 'undefined') {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            resolve(xhr.status >= 200 && xhr.status < 300);
          }
        };
        xhr.onerror = () => resolve(false);
        xhr.send(data);
      } catch {
        resolve(false);
      }
    } else {
      resolve(false);
    }
  });
}

/**
 * Create a transport function that tries multiple methods
 */
export function createTransport(endpoint: string, debug: boolean) {
  const singleUrl = `${endpoint}/a/e`;
  const batchUrl = `${endpoint}/a/b`;

  const log = debug ? (...args: unknown[]) => console.log('[skedox]', ...args) : () => {};

  /**
   * Send a single event
   */
  async function sendEvent(event: AnalyticsEvent): Promise<boolean> {
    const data = JSON.stringify(event);
    log('Sending event:', event.t, event.p);

    // Try sendBeacon first (non-blocking, survives page close)
    if (sendBeacon(singleUrl, data)) {
      log('Sent via beacon');
      return true;
    }

    // Try fetch with keepalive
    if (await sendFetch(singleUrl, data)) {
      log('Sent via fetch');
      return true;
    }

    // Fallback to XHR
    if (await sendXHR(singleUrl, data)) {
      log('Sent via XHR');
      return true;
    }

    log('Failed to send event');
    return false;
  }

  /**
   * Send a batch of events
   */
  async function sendBatch(events: AnalyticsEvent[]): Promise<boolean> {
    if (events.length === 0) return true;

    const payload: BatchPayload = { events };
    const data = JSON.stringify(payload);
    log('Sending batch:', events.length, 'events');

    // Try sendBeacon first
    if (sendBeacon(batchUrl, data)) {
      log('Batch sent via beacon');
      return true;
    }

    // Try fetch with keepalive
    if (await sendFetch(batchUrl, data)) {
      log('Batch sent via fetch');
      return true;
    }

    // Fallback to XHR
    if (await sendXHR(batchUrl, data)) {
      log('Batch sent via XHR');
      return true;
    }

    log('Failed to send batch');
    return false;
  }

  return {
    sendEvent,
    sendBatch,
  };
}

export type Transport = ReturnType<typeof createTransport>;
