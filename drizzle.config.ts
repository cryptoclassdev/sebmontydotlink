import { defineConfig } from 'drizzle-kit'

// Studio database migrations. `pnpm studio:generate` writes SQL into drizzle/ after a schema change;
// `pnpm studio:migrate` (also run by `pnpm build` when DATABASE_URL is set) applies them.
export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/studio/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL || '' },
  strict: true,
})
