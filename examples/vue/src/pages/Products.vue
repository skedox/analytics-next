<script setup lang="ts">
import { useTrackCallback } from '@skedox/vue';

interface Product {
  id: number;
  name: string;
  price: number;
}

const products: Product[] = [
  { id: 1, name: 'Widget Pro', price: 99 },
  { id: 2, name: 'Widget Plus', price: 149 },
  { id: 3, name: 'Widget Max', price: 199 },
];

// Create a reusable tracking function
const trackAddToCart = useTrackCallback('add_to_cart');

const handleAddToCart = (product: Product) => {
  trackAddToCart({
    product_id: product.id,
    product_name: product.name,
    price: product.price,
  });
};
</script>

<template>
  <div class="page">
    <h2>Products</h2>
    <p>Click "Add to Cart" to track e-commerce events.</p>

    <div class="products">
      <div v-for="product in products" :key="product.id" class="product-card">
        <h3>{{ product.name }}</h3>
        <p class="price">${{ product.price }}</p>
        <button class="btn btn-success" @click="handleAddToCart(product)">
          Add to Cart
        </button>
      </div>
    </div>
  </div>
</template>
