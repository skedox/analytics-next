import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AnalyticsProvider } from '@skedox/react';
import App from './App';
import './index.css';

const ORG_ID = '7bf5c63d-05c4-4b9f-80b9-7676cfa62d4c';
const PUSH_URL = import.meta.env.VITE_PUSH_URL || 'https://push.skedox.com';

console.log('[skedox] Endpoint:', PUSH_URL);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AnalyticsProvider config={{ orgId: ORG_ID, endpoint: PUSH_URL, debug: true }}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AnalyticsProvider>
  </React.StrictMode>
);
