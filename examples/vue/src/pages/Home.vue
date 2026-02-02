<script setup lang="ts">
import { useAnalytics } from '@skedox/vue';

const { track } = useAnalytics();

const handleCtaClick = () => {
  track('cta_click', { location: 'home', variant: 'primary' });
};
</script>

<template>
  <div class="page">
    <h2>Home</h2>
    <p>Welcome to the Skedox Analytics Vue example.</p>

    <div class="buttons">
      <button class="btn btn-primary" @click="handleCtaClick">Track CTA Click</button>

      <!-- Using v-track directive -->
      <button class="btn btn-success" v-track="'hero_button'">v-track Directive</button>

      <!-- v-track with data -->
      <button class="btn btn-warning" v-track="{ event: 'action', data: 'test' }">
        v-track with Data
      </button>
    </div>
  </div>
</template>
