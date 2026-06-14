import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'tests/e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['lib/**', 'components/**', 'app/api/**'],
      exclude: [
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        'app/layout.tsx',
        'app/globals.css',
        // Type-only modules have no runtime statements to cover.
        'lib/types.ts',
        // RSC pages + Next.js route files need the Next.js runtime to render;
        // they are covered by Playwright e2e (tests/e2e/*) instead.
        'app/**/page.tsx',
        'app/**/not-found.tsx',
        'app/sitemap.ts',
        'app/robots.ts',
        // Async server components that fetch site settings; exercised by e2e.
        'components/Header.tsx',
        'components/Footer.tsx',
        'components/AnalyticsInjector.tsx',
        'components/SearchTrigger.tsx',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
