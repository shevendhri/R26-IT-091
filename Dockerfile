FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for image/ML libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy dependencies and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set default port if not provided by cloud platform
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start FastAPI server using dynamic $PORT (Railway / Cloud Run compatible)
CMD ["sh", "-c", "python -m uvicorn backend.app:app --host 0.0.0.0 --port ${PORT:-5000}"]
