import type { AnalyticsEvent } from './types';
import type { Transport } from './transport';
import { saveQueue, loadQueue } from './storage';

export interface QueueOptions {
  batchSize: number;
  flushInterval: number;
  transport: Transport;
  debug: boolean;
}

/**
 * Create an event queue with batching and offline support
 */
export function createQueue(options: QueueOptions) {
  const { batchSize, flushInterval, transport, debug } = options;

  let queue: AnalyticsEvent[] = [];
  let flushTimer: ReturnType<typeof setTimeout> | null = null;
  let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const log = debug ? (...args: unknown[]) => console.log('[skedox:queue]', ...args) : () => {};

  // Load any events from previous offline session
  const savedEvents = loadQueue() as AnalyticsEvent[];
  if (savedEvents.length > 0) {
    queue.push(...savedEvents);
    log('Loaded', savedEvents.length, 'events from storage');
  }

  // Track online/offline status
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      isOnline = true;
      log('Back online, flushing queue');
      flush();
    });

    window.addEventListener('offline', () => {
      isOnline = false;
      log('Offline, queuing events');
    });

    // Flush on page hide (mobile/tab close)
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flush();
      }
    });

    // Save queue before unload if offline
    window.addEventListener('beforeunload', () => {
      if (!isOnline && queue.length > 0) {
        saveQueue(queue);
      }
    });
  }

  /**
   * Start the flush timer
   */
  function startTimer(): void {
    if (flushTimer) return;
    if (flushInterval > 0) {
      flushTimer = setTimeout(() => {
        flushTimer = null;
        flush();
      }, flushInterval);
    }
  }

  /**
   * Stop the flush timer
   */
  function stopTimer(): void {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
  }

  /**
   * Add an event to the queue
   */
  function push(event: AnalyticsEvent): void {
    queue.push(event);
    log('Queued event:', event.t);

    // Flush immediately if batch size reached
    if (queue.length >= batchSize) {
      flush();
    } else {
      startTimer();
    }
  }

  /**
   * Flush all queued events
   */
  async function flush(): Promise<void> {
    stopTimer();

    if (queue.length === 0) {
      log('Nothing to flush');
      return;
    }

    if (!isOnline) {
      log('Offline, saving queue to storage');
      saveQueue(queue);
      return;
    }

    // Take all events from queue
    const events = queue.splice(0, queue.length);
    log('Flushing', events.length, 'events');

    // Send as batch if multiple events, single otherwise
    const success =
      events.length === 1
        ? await transport.sendEvent(events[0])
        : await transport.sendBatch(events);

    // Re-queue failed events
    if (!success) {
      log('Flush failed, re-queuing events');
      queue.unshift(...events);
      saveQueue(queue);
    }
  }

  /**
   * Destroy the queue and clean up
   */
  function destroy(): void {
    stopTimer();
    if (queue.length > 0) {
      saveQueue(queue);
    }
    queue = [];
  }

  return {
    push,
    flush,
    destroy,
    get length() {
      return queue.length;
    },
  };
}

export type Queue = ReturnType<typeof createQueue>;
