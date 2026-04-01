import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://glitch:glitch_secret@localhost:5432/glitch_db',
  },
  verbose: true,
  strict: true,
})
