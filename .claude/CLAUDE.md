# Prelegal Project

## Overview

Prelegal is a chat-first SaaS platform for drafting legal agreements based on customizable templates. Users engage in natural conversation with an AI assistant to describe their document needs, and the system extracts relevant information to automatically populate legal document templates.

### Status
- ✅ **Multi-template chat system** (PL-6) - Users can select and generate documents from multiple templates via AI chat
- ✅ **Multi-user support with document persistence** (PL-7) - User authentication, saved documents, dark mode
- ✅ **4 core templates** - MNDA, NDA, Comprehensive NDA, Service Agreement
- 🔄 **Active development** - Recently merged features for document management and user experience improvements

### Available Templates
The application supports the following templates via AI chat with full user authentication and document persistence:
- Mutual Non-Disclosure Agreement (MNDA)
- Non-Disclosure Agreement (NDA)
- Comprehensive Non-Disclosure Agreement
- Service Agreement

### Core Architecture
The chat-first interface leverages **Structured Outputs** from LLMs to extract document fields naturally from conversation, converting unstructured user input into properly populated legal documents.

## Development process

When instructed to build a feature:
1. Use Atlassian tools to read feature specifications from Jira (if available)
2. Develop the feature following best practices:
   - Create feature branch from main
   - Make focused commits with clear messages
   - Test thoroughly (unit tests for backend logic, manual testing for UI/integration)
   - Ensure type safety (TypeScript frontend, type hints in backend)
3. Submit a pull request and ensure all CI checks pass
4. Merge to main after review and testing

## AI design

### LLM Integration
- **Model**: `openrouter/openai/gpt-oss-120b` via OpenRouter with Cerebras inference
- **Method**: Single LLM call with Structured Outputs (no streaming)
- **Purpose**: Extract document field values from natural conversation
- **Credentials**: OPENROUTER_API_KEY stored in `.env` file

### Chat Flow
1. User describes their document needs in natural language
2. System sends conversation history + template schema to LLM
3. LLM extracts structured field values using Pydantic models
4. System validates extracted values and populates template
5. Document is generated and offered for download/saving

### Implementation
Use the `cerebras` skill to integrate LLM calls via LiteLLM. Always use Structured Outputs with Pydantic model validation for reliable field extraction.

## Technical design

### Architecture
- **Backend** (`backend/`): Python FastAPI application using `uv` package manager
- **Frontend** (`frontend/`): Next.js 14 with React 18 and TypeScript
- **Database**: SQLite with Alembic migrations for schema management
- **Containerization**: Docker setup with single `Dockerfile` for full-stack deployment
- **Static Assets**: Frontend is built and served via FastAPI

### Project Structure
```
backend/           # FastAPI service (Python/uv)
frontend/          # Next.js app (TypeScript/React)
templates/         # Legal document templates (JSON)
scripts/           # Start/stop scripts for different platforms
  - start-mac.sh / stop-mac.sh
  - start-linux.sh / stop-linux.sh
  - start-windows.ps1 / stop-windows.ps1
```

### Running the Application
- **Docker**: `docker build -t prelegal . && docker run -p 8000:8000 prelegal`
- **Local**: `./scripts/start-mac.sh` (or appropriate OS script)
- **Backend API**: http://localhost:8000
- **Frontend**: Served from same origin as backend

### Database
- SQLite database auto-created on container startup
- Alembic migrations in `backend/alembic/`
- Users table with authentication support
- Documents table for persisting generated agreements

## Recently Completed Features

### PL-6: Multi-Template Chat System
- Users can select from multiple templates before initiating chat
- Chat interface guides users through document requirements
- Template selection persists through conversation
- Document generation supports all 4 templates

### PL-7: Multi-User Support & Document Persistence
- User authentication (sign up/sign in)
- "My Documents" dashboard to view previously generated documents
- Documents saved to database with timestamps
- User-specific document retrieval and management
- Dark mode support throughout application
- UI polish and error handling improvements

## Color Scheme
- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`