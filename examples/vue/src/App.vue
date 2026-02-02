<script setup lang="ts">
import { useRoute } from 'vue-router';
import { usePageview, useIdentity, useAnalytics } from '@skedox/analytics-vue';
import { ref, computed } from 'vue';

const route = useRoute();

// Auto-track pageviews
usePageview(() => route.path);

// Get identity
const { visitorId, sessionId } = useIdentity();

// Get analytics methods
const analytics = useAnalytics();

// Track enabled state
const isEnabled = ref(true);

const handleOptOut = () => {
  analytics.optOut();
  isEnabled.value = false;
};

const handleOptIn = () => {
  analytics.optIn();
  isEnabled.value = true;
};

const statusClass = computed(() => (isEnabled.value ? 'badge-success' : 'badge-danger'));
const statusText = computed(() => (isEnabled.value ? 'Active' : 'Disabled'));
</script>

<template>
  <div class="app">
    <header>
      <h1>Skedox Analytics - Vue</h1>
      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/about">About</router-link>
        <router-link to="/products">Products</router-link>
        <router-link to="/contact">Contact</router-link>
      </nav>
    </header>

    <main>
      <router-view />
    </main>

    <aside>
      <div class="status-panel">
        <div class="status-item">
          <label>Status</label>
          <span class="badge" :class="statusClass">{{ statusText }}</span>
        </div>
        <div class="status-item">
          <label>Visitor ID</label>
          <code>{{ visitorId || 'N/A' }}</code>
        </div>
        <div class="status-item">
          <label>Session ID</label>
          <code>{{ sessionId || 'N/A' }}</code>
        </div>
        <div class="status-actions">
          <button class="btn btn-sm btn-danger" @click="handleOptOut">Opt Out</button>
          <button class="btn btn-sm btn-success" @click="handleOptIn">Opt In</button>
        </div>
      </div>
    </aside>

    <footer>
      <p>Open browser console to see tracking events (debug mode enabled)</p>
    </footer>
  </div>
</template>
