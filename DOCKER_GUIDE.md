# Docker Setup & Troubleshooting Guide

## Quick Start

### macOS
```bash
./scripts/start-mac.sh
```

### Linux
```bash
./scripts/start-linux.sh
```

### Windows
```powershell
.\scripts\start-windows.ps1
```

The API will be available at `http://localhost:8000`

## Common Issues & Solutions

### ❌ Error: "Unable to find image 'prelegal:latest' locally"

**Cause:** Docker build failed or didn't complete.

**Solution:**

1. **Check Docker is running:**
   ```bash
   docker info
   ```
   If it fails, start Docker Desktop.

2. **Try building manually with verbose output:**
   ```bash
   docker build -t prelegal:latest . --progress=plain
   ```
   This shows you exactly where the build fails.

3. **Clean up and retry:**
   ```bash
   docker rmi prelegal:latest 2>/dev/null || true
   ./scripts/start-mac.sh  # or your OS script
   ```

4. **Check for disk space:**
   ```bash
   docker system df
   ```
   If you're out of space, run:
   ```bash
   docker system prune -a
   ```

---

### ❌ Error: "Docker is not running. Please start Docker Desktop first."

**Solution:**
- On macOS: Open the Docker app from Applications folder
- On Linux: Run `sudo systemctl start docker`
- On Windows: Open Docker Desktop from Start menu

---

### ❌ Error: "failed to create network... address already in use"

**Cause:** Port 8000 is already in use.

**Solution:**

1. **Find what's using port 8000:**
   - macOS/Linux: `lsof -i :8000`
   - Windows: `netstat -ano | findstr :8000`

2. **Stop the existing service** or use a different port:
   ```bash
   docker run -d -p 8001:8000 --name prelegal-alt prelegal:latest
   ```

3. **Or stop Prelegal and restart:**
   ```bash
   ./scripts/stop-mac.sh
   ./scripts/start-mac.sh
   ```

---

### ❌ Error: "backend not found" or "python: can't open file"

**Cause:** Missing backend files or incorrect working directory.

**Solution:**

1. **Verify backend directory exists:**
   ```bash
   ls backend/main.py
   ls backend/app/
   ```

2. **Check Dockerfile paths are correct:**
   ```bash
   cat Dockerfile | grep COPY
   ```

3. **Rebuild from scratch:**
   ```bash
   docker rmi prelegal:latest
   docker system prune -f
   ./scripts/start-mac.sh
   ```

---

### ❌ Error: "npm ERR! code ENOENT"

**Cause:** Frontend build failed (usually optional).

**Solution:**

The new Dockerfile handles this gracefully. The frontend build is optional and won't block the backend. If you need the frontend:

```bash
cd frontend
npm install
npm run build
cd ..
docker build -t prelegal:latest .
```

---

### ⚠️  Slow Build or Timeout

**Cause:** Installing dependencies takes time, especially first run.

**Solution:**

1. **Give Docker more resources:**
   - Open Docker Desktop → Settings → Resources
   - Increase CPUs (to at least 4) and Memory (to at least 4GB)

2. **Monitor build progress:**
   ```bash
   docker build -t prelegal:latest . --progress=plain
   ```

3. **Use BuildKit for faster builds (optional):**
   ```bash
   docker buildx build -t prelegal:latest .
   ```

---

## Verifying the Build

### Check if build succeeded:
```bash
docker image ls | grep prelegal
```

Should output:
```
prelegal           latest    abc123def456    2 minutes ago    1.2GB
```

### Check if container is running:
```bash
docker ps | grep prelegal
```

### View logs:
```bash
docker logs prelegal
```

### Test the API:
```bash
curl http://localhost:8000/health
# Should return: {"status":"ok"}
```

---

## Testing Without Docker

You can also run the backend locally without Docker:

```bash
cd backend

# Install dependencies
python3 -m pip install fastapi uvicorn sqlalchemy pydantic argon2-cffi \
  passlib python-jose python-dotenv email-validator

# Run tests
python3 -m pytest tests/ -v

# Start server
python3 main.py
```

---

## Docker Commands Reference

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View images
docker images

# View logs
docker logs prelegal
docker logs -f prelegal  # Follow logs

# Stop container
docker stop prelegal

# Remove container
docker rm prelegal

# Remove image
docker rmi prelegal:latest

# Clean up unused Docker resources
docker system prune -a

# Rebuild image
docker build -t prelegal:latest .

# Run a command in container
docker exec -it prelegal bash

# Inspect container details
docker inspect prelegal
```

---

## Development Tips

### Mount volumes for live code changes:
```bash
docker run -d \
  --name prelegal \
  -p 8000:8000 \
  -v "$(pwd)/backend:/app/backend" \
  prelegal:latest
```

Now code changes in `backend/` are reflected in the container.

### Access container shell:
```bash
docker exec -it prelegal bash
```

### Run tests in container:
```bash
docker exec prelegal python -m pytest tests/ -v
```

---

## Environment Variables

The `.env` file is loaded automatically. Key variables:

```env
DEBUG=False              # Set to True for verbose logging
DATABASE_URL=sqlite:///./data.db
SECRET_KEY=your-secret-key-change-in-production
OPENROUTER_API_KEY=your-api-key
```

### To change configuration:
1. Edit `.env`
2. Stop and restart container:
   ```bash
   ./scripts/stop-mac.sh
   ./scripts/start-mac.sh
   ```

---

## Performance Notes

**First build:** ~5-10 minutes (downloads Python, Node, and dependencies)
**Subsequent builds:** ~30 seconds (uses cached layers)
**Image size:** ~1.2GB (Python + Node + dependencies)

To reduce size for production, use a multi-stage build that excludes dev dependencies.

---

## Troubleshooting Checklist

- [ ] Docker is installed and running
- [ ] Port 8000 is not in use
- [ ] Backend directory exists with main.py
- [ ] .env file exists in project root
- [ ] Disk space available (>10GB recommended)
- [ ] Docker has sufficient CPU and memory allocated

Still having issues? Run:
```bash
docker build -t prelegal:latest . --progress=plain 2>&1 | tail -100
```

This shows the last 100 lines of the build process, which usually contains the error.
