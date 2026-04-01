import { pgTable, uuid, varchar, text, timestamp, jsonb, integer, pgEnum, index, vector } from 'drizzle-orm/pg-core'

// Enums
export const entityTypeEnum = pgEnum('entity_type', [
  'TASK',
  'JOURNAL', 
  'LOG',
  'REMINDER',
  'KB_ARTICLE',
  'GOAL',
  'FINANCIAL_DOC'
])

export const entityStatusEnum = pgEnum('entity_status', [
  'BACKLOG',
  'TODO',
  'IN_PROGRESS',
  'DONE',
  'ARCHIVED',
  'DRAFT'
])

export const privacyLevelEnum = pgEnum('privacy_level', [
  'PUBLIC',
  'PRIVATE',
  'ENCRYPTED'
])

export const ocrStatusEnum = pgEnum('ocr_status', [
  'NONE',
  'PENDING',
  'COMPLETED',
  'FAILED'
])

export const relationshipEnum = pgEnum('relationship_type', [
  'BLOCKS',
  'RELATES_TO',
  'PART_OF',
  'EVIDENCE_FOR',
  'PAID_BY'
])

// Scopes table - organizes entities into domains
export const scopes = pgTable('scopes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  privacyLevel: privacyLevelEnum('privacy_level').notNull().default('PRIVATE'),
  basePath: varchar('base_path', { length: 512 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  nameIdx: index('scope_name_idx').on(table.name),
}))

// Entities table - core data model
export const entities = pgTable('entities', {
  id: uuid('id').primaryKey().defaultRandom(),
  scopeId: uuid('scope_id').references(() => scopes.id, { onDelete: 'cascade' }),
  type: entityTypeEnum('type').notNull(),
  title: varchar('title', { length: 512 }).notNull(),
  content: text('content'),
  metadata: jsonb('metadata').default({}),
  status: entityStatusEnum('status').notNull().default('BACKLOG'),
  priority: integer('priority').default(5),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  scopeIdx: index('entity_scope_idx').on(table.scopeId),
  typeIdx: index('entity_type_idx').on(table.type),
  statusIdx: index('entity_status_idx').on(table.status),
  createdAtIdx: index('entity_created_at_idx').on(table.createdAt),
}))

// Documents table - tracks local files
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityId: uuid('entity_id').references(() => entities.id, { onDelete: 'cascade' }),
  filePath: varchar('file_path', { length: 1024 }).notNull(),
  fileName: varchar('file_name', { length: 512 }).notNull(),
  mimeType: varchar('mime_type', { length: 255 }),
  md5Hash: varchar('md5_hash', { length: 32 }),
  ocrStatus: ocrStatusEnum('ocr_status').notNull().default('NONE'),
  pageCount: integer('page_count'),
  fileSize: integer('file_size'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  entityIdx: index('doc_entity_idx').on(table.entityId),
  hashIdx: index('doc_hash_idx').on(table.md5Hash),
  ocrStatusIdx: index('doc_ocr_status_idx').on(table.ocrStatus),
}))

// Links table - graph relationships between entities
export const links = pgTable('links', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceId: uuid('source_id').references(() => entities.id, { onDelete: 'cascade' }).notNull(),
  targetId: uuid('target_id').references(() => entities.id, { onDelete: 'cascade' }).notNull(),
  relationship: relationshipEnum('relationship').notNull(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  sourceIdx: index('link_source_idx').on(table.sourceId),
  targetIdx: index('link_target_idx').on(table.targetId),
  relationshipIdx: index('link_relationship_idx').on(table.relationship),
  uniqueLink: index('link_unique_idx').on(table.sourceId, table.targetId, table.relationship),
}))

// Embeddings table - vector storage for RAG
export const embeddings = pgTable('embeddings', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityId: uuid('entity_id').references(() => entities.id, { onDelete: 'cascade' }).notNull(),
  chunkIndex: integer('chunk_index').notNull(),
  chunkText: text('chunk_text').notNull(),
  embedding: vector('embedding', { dimensions: 384 }), // For all-MiniLM-L6-v2
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  entityIdx: index('embedding_entity_idx').on(table.entityId),
  // HNSW index for fast similarity search - created via migration
}))

// Habits table - for tracking recurring activities
export const habits = pgTable('habits', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  frequency: varchar('frequency', { length: 50 }), // daily, weekly, etc.
  scopeId: uuid('scope_id').references(() => scopes.id, { onDelete: 'cascade' }),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// Habit entries - atomic tracking
export const habitEntries = pgTable('habit_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  habitId: uuid('habit_id').references(() => habits.id, { onDelete: 'cascade' }).notNull(),
  entityId: uuid('entity_id').references(() => entities.id, { onDelete: 'set null' }),
  value: jsonb('value'), // flexible metric storage
  notes: text('notes'),
  completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  habitIdx: index('habit_entry_habit_idx').on(table.habitId),
  completedAtIdx: index('habit_entry_completed_idx').on(table.completedAt),
}))

// Types for TypeScript
export type Scope = typeof scopes.$inferSelect
export type NewScope = typeof scopes.$inferInsert
export type Entity = typeof entities.$inferSelect
export type NewEntity = typeof entities.$inferInsert
export type Document = typeof documents.$inferSelect
export type NewDocument = typeof documents.$inferInsert
export type Link = typeof links.$inferSelect
export type NewLink = typeof links.$inferInsert
export type Embedding = typeof embeddings.$inferSelect
export type NewEmbedding = typeof embeddings.$inferInsert
export type Habit = typeof habits.$inferSelect
export type NewHabit = typeof habits.$inferInsert
export type HabitEntry = typeof habitEntries.$inferSelect
export type NewHabitEntry = typeof habitEntries.$inferInsert
