-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create custom types (enums)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entity_type') THEN
        CREATE TYPE entity_type AS ENUM ('TASK', 'JOURNAL', 'LOG', 'REMINDER', 'KB_ARTICLE', 'GOAL', 'FINANCIAL_DOC');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entity_status') THEN
        CREATE TYPE entity_status AS ENUM ('BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'ARCHIVED', 'DRAFT');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'privacy_level') THEN
        CREATE TYPE privacy_level AS ENUM ('PUBLIC', 'PRIVATE', 'ENCRYPTED');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ocr_status') THEN
        CREATE TYPE ocr_status AS ENUM ('NONE', 'PENDING', 'COMPLETED', 'FAILED');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relationship_type') THEN
        CREATE TYPE relationship_type AS ENUM ('BLOCKS', 'RELATES_TO', 'PART_OF', 'EVIDENCE_FOR', 'PAID_BY');
    END IF;
END $$;

-- Scopes table
CREATE TABLE IF NOT EXISTS scopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    privacy_level privacy_level NOT NULL DEFAULT 'PRIVATE',
    base_path VARCHAR(512),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS scope_name_idx ON scopes(name);

-- Entities table
CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope_id UUID REFERENCES scopes(id) ON DELETE CASCADE,
    type entity_type NOT NULL,
    title VARCHAR(512) NOT NULL,
    content TEXT,
    metadata JSONB DEFAULT '{}',
    status entity_status NOT NULL DEFAULT 'BACKLOG',
    priority INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS entity_scope_idx ON entities(scope_id);
CREATE INDEX IF NOT EXISTS entity_type_idx ON entities(type);
CREATE INDEX IF NOT EXISTS entity_status_idx ON entities(status);
CREATE INDEX IF NOT EXISTS entity_created_at_idx ON entities(created_at);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    file_path VARCHAR(1024) NOT NULL,
    file_name VARCHAR(512) NOT NULL,
    mime_type VARCHAR(255),
    md5_hash VARCHAR(32),
    ocr_status ocr_status NOT NULL DEFAULT 'NONE',
    page_count INTEGER,
    file_size INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS doc_entity_idx ON documents(entity_id);
CREATE INDEX IF NOT EXISTS doc_hash_idx ON documents(md5_hash);
CREATE INDEX IF NOT EXISTS doc_ocr_status_idx ON documents(ocr_status);

-- Links table (graph relationships)
CREATE TABLE IF NOT EXISTS links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    relationship relationship_type NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT no_self_link CHECK (source_id != target_id)
);

CREATE INDEX IF NOT EXISTS link_source_idx ON links(source_id);
CREATE INDEX IF NOT EXISTS link_target_idx ON links(target_id);
CREATE INDEX IF NOT EXISTS link_relationship_idx ON links(relationship);
CREATE UNIQUE INDEX IF NOT EXISTS link_unique_idx ON links(source_id, target_id, relationship);

-- Embeddings table (vector storage)
CREATE TABLE IF NOT EXISTS embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(384),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_entity_chunk UNIQUE (entity_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS embedding_entity_idx ON embeddings(entity_id);

-- HNSW index for fast similarity search on embeddings
CREATE INDEX IF NOT EXISTS embedding_hnsw_idx ON embeddings 
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    frequency VARCHAR(50),
    scope_id UUID REFERENCES scopes(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habit entries table
CREATE TABLE IF NOT EXISTS habit_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
    value JSONB,
    notes TEXT,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS habit_entry_habit_idx ON habit_entries(habit_id);
CREATE INDEX IF NOT EXISTS habit_entry_completed_idx ON habit_entries(completed_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'scopes_updated_at') THEN
        CREATE TRIGGER scopes_updated_at BEFORE UPDATE ON scopes
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'entities_updated_at') THEN
        CREATE TRIGGER entities_updated_at BEFORE UPDATE ON entities
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'documents_updated_at') THEN
        CREATE TRIGGER documents_updated_at BEFORE UPDATE ON documents
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'habits_updated_at') THEN
        CREATE TRIGGER habits_updated_at BEFORE UPDATE ON habits
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
