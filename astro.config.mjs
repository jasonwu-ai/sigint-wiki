import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  integrations: [tailwind()],
  vite: {
    define: {
      'import.meta.env.BUILT_AT': JSON.stringify(process.env.BUILT_AT || 'unknown'),
    },
  },
});
