const VISITOR_KEY = '_sk_v';
const SESSION_KEY = '_sk_s';
const OPT_OUT_KEY = '_sk_opt_out';
const QUEUE_KEY = '_sk_queue';

/**
 * Check if storage is available
 */
function isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
  try {
    const storage = window[type];
    const test = '__storage_test__';
    storage.setItem(test, test);
    storage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create a persistent visitor ID
 */
export function getVisitorId(): string | null {
  if (!isStorageAvailable('localStorage')) {
    return null;
  }

  let visitorId = localStorage.getItem(VISITOR_KEY);
  if (!visitorId) {
    visitorId = generateUUID();
    localStorage.setItem(VISITOR_KEY, visitorId);
  }
  return visitorId;
}

/**
 * Get or create a session-scoped session ID
 */
export function getSessionId(): string | null {
  if (!isStorageAvailable('sessionStorage')) {
    return null;
  }

  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

/**
 * Check if user has opted out
 */
export function isOptedOut(): boolean {
  if (!isStorageAvailable('localStorage')) {
    return false;
  }
  return localStorage.getItem(OPT_OUT_KEY) === '1';
}

/**
 * Set opt-out preference
 */
export function setOptOut(optOut: boolean): void {
  if (!isStorageAvailable('localStorage')) {
    return;
  }
  if (optOut) {
    localStorage.setItem(OPT_OUT_KEY, '1');
  } else {
    localStorage.removeItem(OPT_OUT_KEY);
  }
}

/**
 * Save events queue to localStorage for offline support
 */
export function saveQueue(events: unknown[]): void {
  if (!isStorageAvailable('localStorage')) {
    return;
  }
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(events));
  } catch {
    // Storage full, ignore
  }
}

/**
 * Load events queue from localStorage
 */
export function loadQueue(): unknown[] {
  if (!isStorageAvailable('localStorage')) {
    return [];
  }
  try {
    const data = localStorage.getItem(QUEUE_KEY);
    if (data) {
      localStorage.removeItem(QUEUE_KEY);
      return JSON.parse(data);
    }
  } catch {
    // Invalid data, ignore
  }
  return [];
}

/**
 * Clear all stored data
 */
export function clearStorage(): void {
  if (isStorageAvailable('localStorage')) {
    localStorage.removeItem(VISITOR_KEY);
    localStorage.removeItem(OPT_OUT_KEY);
    localStorage.removeItem(QUEUE_KEY);
  }
  if (isStorageAvailable('sessionStorage')) {
    sessionStorage.removeItem(SESSION_KEY);
  }
}
