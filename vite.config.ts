import { defineConfig } from 'vitest/config';

// base: './' toimii sekä paikallisesti että GitHub Pagesissa (/EquinoxUni/).
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 2000,
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
