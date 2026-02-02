<script setup lang="ts">
import { ref } from 'vue';
import { useAnalytics } from '@skedox/vue';

const { track } = useAnalytics();
const submitted = ref(false);

const handleSubmit = () => {
  track('form_submit', { form: 'contact', success: true });
  submitted.value = true;
};
</script>

<template>
  <div class="page">
    <h2>Contact</h2>

    <p v-if="submitted" class="success">Thank you! Form submitted.</p>

    <form v-else @submit.prevent="handleSubmit" class="form">
      <input type="text" placeholder="Name" required />
      <input type="email" placeholder="Email" required />
      <textarea placeholder="Message" required></textarea>
      <button type="submit" class="btn btn-primary">Submit (Track Form)</button>
    </form>
  </div>
</template>
