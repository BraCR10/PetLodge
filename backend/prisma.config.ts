import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

type Env = {
  DATABASE_URL: string;
};

export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node -r ts-node/register prisma/seed.ts',
  },
  datasource: {
    url: env<Env>('DATABASE_URL'),
  },
});
