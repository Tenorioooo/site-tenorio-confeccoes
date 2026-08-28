import { defineConfig } from '@prisma/cli';

export default defineConfig({
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Adjust the URL if you use a different DB location
    url: 'file:./dev.db',
  },
});
