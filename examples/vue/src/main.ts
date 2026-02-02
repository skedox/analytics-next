import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { SkedoxPlugin } from '@skedox/vue';
import App from './App.vue';
import './style.css';

// Import pages
import Home from './pages/Home.vue';
import About from './pages/About.vue';
import Products from './pages/Products.vue';
import Contact from './pages/Contact.vue';

const ORG_ID = '7bf5c63d-05c4-4b9f-80b9-7676cfa62d4c';
const PUSH_URL = import.meta.env.VITE_PUSH_URL || 'https://push.skedox.com';

console.log('[skedox] Endpoint:', PUSH_URL);

// Router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/products', component: Products },
    { path: '/contact', component: Contact },
  ],
});

// Create app
const app = createApp(App);

// Install Skedox Analytics
app.use(SkedoxPlugin, {
  orgId: ORG_ID,
  endpoint: PUSH_URL,
  debug: true,
});

// Install router
app.use(router);

// Mount
app.mount('#app');
