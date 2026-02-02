import { init, track, trackPageview, getVisitorId, getSessionId, optOut, optIn, isEnabled } from '@skedox/vanilla';

const ORG_ID = '7bf5c63d-05c4-4b9f-80b9-7676cfa62d4c';
const PUSH_URL = import.meta.env.VITE_PUSH_URL || 'https://push.skedox.com';

// Log helper
function log(message) {
  const logEl = document.getElementById('log');
  const time = new Date().toLocaleTimeString();
  logEl.textContent += `[${time}] ${message}\n`;
  logEl.scrollTop = logEl.scrollHeight;
}

// Show endpoint
document.getElementById('endpoint').textContent = `Endpoint: ${PUSH_URL}`;

// Initialize
init({
  orgId: ORG_ID,
  endpoint: PUSH_URL,
  debug: true,
  autoTrack: true,
  spa: true
});

// Update status
document.getElementById('status').textContent = `Tracking active for org: ${ORG_ID}`;
document.getElementById('status').classList.add('active');
log(`Analytics initialized (endpoint: ${PUSH_URL})`);

// Update visitor info
document.getElementById('visitorId').textContent = getVisitorId() || 'N/A';
document.getElementById('sessionId').textContent = getSessionId() || 'N/A';

// SPA navigation simulation
document.getElementById('nav').addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    e.preventDefault();
    const path = e.target.getAttribute('href');

    // Update URL without reload
    history.pushState({}, '', path);

    // Update active link
    document.querySelectorAll('#nav a').forEach(a => a.classList.remove('active'));
    e.target.classList.add('active');

    log(`Navigated to ${path} (auto-tracked)`);
  }
});

// Expose functions to window for onclick handlers
window.trackEvent = (event, data) => {
  track(event, data);
  log(`Event: ${event} - ${JSON.stringify(data)}`);
};

window.manualPageview = (path) => {
  trackPageview(path);
  log(`Pageview: ${path}`);
};

window.handleOptOut = () => {
  optOut();
  log('Opted out of tracking');
  document.getElementById('status').textContent = 'Tracking disabled (opted out)';
  document.getElementById('status').classList.remove('active');
};

window.handleOptIn = () => {
  optIn();
  log('Opted in to tracking');
  document.getElementById('status').textContent = `Tracking active for org: ${ORG_ID}`;
  document.getElementById('status').classList.add('active');
};

window.checkStatus = () => {
  const enabled = isEnabled();
  log(`Tracking enabled: ${enabled}`);
  alert(`Tracking is ${enabled ? 'enabled' : 'disabled'}`);
};
