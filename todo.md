# Glitch API - Development Task List

## Phase 1: Foundation Setup ✅
- [x] Initialize Git repository
- [x] Create package.json with dependencies (TanStack Start, Motia, Drizzle ORM)
- [x] Set up TypeScript configuration
- [x] Create Docker Compose for PostgreSQL + PGvector
- [x] Configure environment variables (.env, .env.example)
- [x] Set up Drizzle ORM with schema definitions
- [x] Create initial database migration (pgvector, tables, indexes)
- [x] Scaffold TanStack Start app structure
- [x] Create basic routes (Home, Entities, Documents)
- [x] Set up Motia workflow configuration
- [x] Create workflow steps (Document Watcher, OCR Processor, Embedding Generator)

## Phase 2: Database & API Development 🔄
- [ ] Implement database connection pooling and error handling
- [ ] Create API routes for CRUD operations on entities
- [ ] Implement scope management endpoints
- [ ] Build document upload API with file validation
- [ ] Create graph query endpoints for entity relationships
- [ ] Implement vector similarity search endpoint
- [ ] Add authentication middleware (JWT)
- [ ] Build habit tracking API endpoints

## Phase 3: OCR Pipeline Implementation 🔄
- [ ] Integrate PaddleOCR or DocTR for local OCR
- [ ] Build PDF to image conversion pipeline
- [ ] Implement image preprocessing (grayscale, deskew, normalize)
- [ ] Create OCR result storage and confidence scoring
- [ ] Build OCR retry logic for failed documents
- [ ] Implement layout analysis for structured documents

## Phase 4: Embedding & RAG System 🔄
- [ ] Integrate sentence-transformers for local embeddings
- [ ] Build text chunking strategies (semantic, fixed, recursive)
- [ ] Implement embedding caching layer
- [ ] Create RAG query pipeline with context retrieval
- [ ] Build hybrid search (keyword + vector)
- [ ] Implement relevance scoring and ranking

## Phase 5: File System Integration 🔄
- [ ] Build file watcher service with chokidar
- [ ] Implement MD5 deduplication logic
- [ ] Create file path reconciliation (weekly scan)
- [ ] Build file move/rename detection
- [ ] Implement disk space monitoring and alerts
- [ ] Create backup automation (pg_dump + rsync)

## Phase 6: Frontend Development 🔄
- [ ] Build entity list view with filtering/sorting
- [ ] Create entity detail page with graph visualization
- [ ] Implement document upload UI with drag-and-drop
- [ ] Build OCR queue monitoring dashboard
- [ ] Create semantic search interface
- [ ] Implement habit tracker UI
- [ ] Build graph relationship visualizer

## Phase 7: Workflow Engine 🔄
- [ ] Implement OCR processing worker with Motia
- [ ] Build embedding generation pipeline
- [ ] Create scheduled tasks (disk cleanup, backups)
- [ ] Implement workflow error handling and retries
- [ ] Build workflow monitoring and logging

## Phase 8: Advanced Features 🔄
- [ ] Implement entity linking suggestions (AI-powered)
- [ ] Build automatic scope detection for documents
- [ ] Create financial document parsing (receipts, invoices)
- [ ] Implement cognitive load tracking
- [ ] Build burnout risk analysis
- [ ] Create automated reminder system

## Phase 9: Testing & Optimization 🔄
- [ ] Write unit tests for API endpoints
- [ ] Create integration tests for workflows
- [ ] Implement load testing for vector search
- [ ] Optimize database queries with explain analyze
- [ ] Build OCR performance benchmarking

## Phase 10: Deployment & Operations 🔄
- [ ] Create production Docker Compose configuration
- [ ] Build deployment scripts
- [ ] Implement health check endpoints
- [ ] Create monitoring dashboard
- [ ] Write operational runbook
- [ ] Set up automated backups

## Current Focus
**Next immediate tasks:**
1. Install npm dependencies (`npm install`)
2. Start PostgreSQL with Docker (`npm run db:up`)
3. Run initial migration (`npm run db:migrate`)
4. Implement the OCR engine integration (PaddleOCR)
5. Build the actual embedding generation with sentence-transformers
