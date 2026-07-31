import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Hérite des plugins et de l'alias `@` de vite.config.ts — une seule source de vérité.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      setupFiles: ['src/vitest.setup.ts'],
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/main.tsx', 'src/**/*.d.ts', 'src/vitest.setup.ts', 'src/theme/**'],
      },
    },
  }),
);
