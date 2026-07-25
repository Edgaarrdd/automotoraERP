# ============================================================
# Backend Dockerfile - CRM Automotora ERP (FastAPI)
# Multi-stage build for optimized production image
# ============================================================

# --- Stage 1: Dependencies ---
FROM python:3.12-slim AS dependencies

WORKDIR /tmp

# Install system-level build dependencies needed by some Python packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libffi-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# --- Stage 2: Runtime ---
FROM python:3.12-slim AS runtime

# Metadata
LABEL maintainer="Automotora Origen SpA"
LABEL description="CRM Automotora ERP - Backend API (FastAPI)"
LABEL version="1.0.0"

# Prevent Python from writing .pyc and enable unbuffered stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Create a non-root user for security
RUN groupadd --gid 1000 appuser && \
    useradd --uid 1000 --gid appuser --shell /bin/bash --create-home appuser

WORKDIR /app

# Copy pre-built Python packages from the dependencies stage
COPY --from=dependencies /install /usr/local

# Copy application source code
COPY ./app ./app

# Create a directory for the SQLite database (if used) with correct permissions
RUN mkdir -p /app/data && chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose the API port
EXPOSE 8000

# Health check — verifies the API root endpoint responds
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')" || exit 1

# Start uvicorn in production mode
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
