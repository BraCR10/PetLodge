import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { bearer } from 'better-auth/plugins';
import { Pool } from 'pg';

// Append search_path as a URL-encoded options param so Better Auth
// reads/writes to the existing neon_auth schema managed by Neon.
const url = new URL(process.env.DATABASE_URL as string);
url.searchParams.set('options', '-c search_path=neon_auth');

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  logger: { level: 'error' },
  database: new Pool({ connectionString: url.toString() }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    bearer(), // enables Authorization: Bearer <token> for mobile clients
  ],
});
