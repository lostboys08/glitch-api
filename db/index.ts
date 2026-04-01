import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'glitch',
  password: process.env.DB_PASSWORD || 'glitch_secret',
  database: process.env.DB_NAME || 'glitch_db',
})

export const db = drizzle(pool, { schema })

// Export pool for direct queries if needed
export { pool }
