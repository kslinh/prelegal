FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js for frontend build
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm

# Copy backend directory entirely
COPY backend ./backend

# Install backend dependencies
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

# Copy frontend
COPY frontend ./frontend

# Build frontend
WORKDIR /app/frontend
RUN npm install && npm run build

# Copy environment file
COPY .env ./

WORKDIR /app/backend

EXPOSE 8000

CMD ["python3", "main.py"]
