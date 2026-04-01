import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { db, pool } from '../db/index'

async function runMigrations() {
  console.log('Running migrations...')
  
  try {
    await migrate(db, { migrationsFolder: './db/migrations' })
    console.log('Migrations completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runMigrations()
