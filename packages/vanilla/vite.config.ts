import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      include: ['src/index.ts'],
      outDir: 'dist',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'skedox',
      formats: ['es', 'cjs', 'iife'],
      fileName: (format) => {
        if (format === 'es') return 'skedox.js';
        if (format === 'cjs') return 'skedox.cjs';
        if (format === 'iife') return 'skedox.iife.js';
        return `skedox.${format}.js`;
      },
    },
    rollupOptions: {
      output: {
        exports: 'named',
      },
    },
    sourcemap: true,
    minify: false,
  },
  resolve: {
    alias: {
      '@skedox/analytics-core': resolve(__dirname, '../core/src/index.ts'),
    },
  },
});
