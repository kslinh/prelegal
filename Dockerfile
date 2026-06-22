FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js for frontend build
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm

# Copy backend requirements
COPY backend/pyproject.toml ./backend/

# Install backend dependencies
RUN pip install --no-cache-dir -e ./backend/

# Copy frontend
COPY frontend ./frontend

# Build frontend
WORKDIR /app/frontend
RUN npm ci && npm run build

# Copy backend code
COPY backend ./backend

# Copy .env
COPY .env ./

WORKDIR /app/backend

EXPOSE 8000

CMD ["python", "main.py"]
