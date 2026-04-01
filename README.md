# Glitch API

Your local-first external brain system. An intelligent document management and knowledge base with OCR, vector search, and graph relationships.

## Architecture

- **Frontend**: TanStack Start (React + Vinxi)
- **Workflow Engine**: Motia
- **Database**: PostgreSQL + PGvector
- **OCR**: PaddleOCR / DocTR (local)
- **Embeddings**: Sentence-Transformers (local)

## Project Structure

```
glitch-api/
├── app/                  # TanStack Start application
│   ├── routes/          # File-based routing
│   ├── client.tsx       # Client entry
│   ├── router.tsx       # Router configuration
│   └── ...
├── db/                  # Database
│   ├── schema.ts        # Drizzle ORM schema
│   ├── migrations/      # SQL migrations
│   └── index.ts         # Database connection
├── workflows/           # Motia workflows
│   ├── document-watcher.ts
│   ├── ocr-processor.ts
│   └── embedding-generator.ts
├── scripts/             # Utility scripts
│   └── migrate.ts       # Database migration runner
├── docker-compose.yml   # PostgreSQL + Redis
├── package.json
└── todo.md             # Development tasks
```

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start PostgreSQL with PGvector**:
   ```bash
   npm run db:up
   ```

3. **Run database migrations**:
   ```bash
   npm run db:migrate
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Start the workflow engine** (in another terminal):
   ```bash
   npm run workflow:dev
   ```

## Features

### Core Entities
- **TASK** - Actionable items with status tracking
- **JOURNAL** - Daily entries and reflections
- **LOG** - Automated system and habit logs
- **REMINDER** - Time-based notifications
- **KB_ARTICLE** - Knowledge base entries
- **GOAL** - Long-term objectives
- **FINANCIAL_DOC** - Financial documents

### Document Pipeline
1. **File Watcher** - Monitors directories for new files
2. **Deduplication** - MD5 hash-based duplicate detection
3. **OCR Processing** - Local text extraction from PDFs/images
4. **Embedding Generation** - Vector storage for semantic search
5. **Graph Linking** - Automatic relationship detection

### Vector Search
- 384-dimensional embeddings (all-MiniLM-L6-v2)
- HNSW index for fast similarity search
- Hybrid keyword + vector retrieval

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL` - PostgreSQL connection string
- `UPLOAD_DIR` - Directory for file uploads
- `OCR_ENGINE` - OCR engine to use (paddleocr)
- `EMBEDDING_MODEL` - Sentence transformer model

## Development

See `todo.md` for the full development task list and current progress.

## License

MIT
