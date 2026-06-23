# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1: build the Next.js static export (needs Node, only at build time)
# ---------------------------------------------------------------------------
FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend

# Install deps first for better layer caching
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Templates are read by generateStaticParams() at build time (../templates)
COPY templates /app/templates
COPY frontend ./

# Produces /app/frontend/out (the static export served by the backend)
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2: install Python deps into a venv (build tools stay in this stage)
# ---------------------------------------------------------------------------
FROM python:3.12-slim AS python-builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --no-cache-dir \
    fastapi==0.115.0 \
    uvicorn[standard]==0.30.0 \
    sqlalchemy==2.0.25 \
    pydantic==2.7.0 \
    pydantic-settings==2.3.0 \
    python-multipart==0.0.6 \
    python-dotenv==1.0.0 \
    litellm==1.40.0 \
    email-validator==2.1.0

# ---------------------------------------------------------------------------
# Stage 3: runtime — Python only, no Node, no build tools, no node_modules
# ---------------------------------------------------------------------------
FROM python:3.12-slim AS runtime

WORKDIR /app

# Virtualenv with the installed dependencies
COPY --from=python-builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Application code and data (.env is excluded via .dockerignore — secrets are
# provided at runtime through --env-file, never baked into the image)
COPY templates ./templates
COPY backend ./backend

# Only the static export from the frontend build — not node_modules or src
COPY --from=frontend-builder /app/frontend/out ./frontend/out

COPY start.sh ./
RUN chmod +x ./start.sh

EXPOSE 8000

CMD ["./start.sh"]
