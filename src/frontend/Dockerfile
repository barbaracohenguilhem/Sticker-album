# Build stage
FROM node:22-slim AS build

WORKDIR /app

# Copy package manifests first for layer caching
COPY package.json package-lock.json ./

# Install dependencies (including devDependencies needed for Vite build)
RUN npm ci

# Copy frontend source and build static assets
COPY . .
RUN npm run build

# Runtime stage
FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Create non-root runtime user
RUN useradd --create-home --shell /usr/sbin/nologin appuser

# Install Python server dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy compiled frontend assets and FastAPI static/config server
COPY --from=build --chown=appuser:appuser /app/dist ./dist
COPY --chown=appuser:appuser frontend_server.py ./

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:3000/config', timeout=3)"]

CMD ["uvicorn", "frontend_server:app", "--host", "0.0.0.0", "--port", "3000"]
