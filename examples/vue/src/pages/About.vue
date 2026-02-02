<script setup lang="ts">
import { useTrackOnce, useAnalytics } from '@skedox/analytics-vue';

// Track page view event once
useTrackOnce('about_page_view', { source: 'navigation' });

const { track } = useAnalytics();

const handleReadMore = () => {
  track('read_more', { page: 'about' });
};
</script>

<template>
  <div class="page">
    <h2>About</h2>
    <p>Learn more about our analytics solution.</p>
    <p>This page uses <code>useTrackOnce</code> to track a single event on mount.</p>

    <div class="buttons">
      <button class="btn btn-primary" @click="handleReadMore">Track Read More</button>
    </div>
  </div>
</template>
