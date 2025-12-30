# Base image (Linux + Python 3.12)
FROM python:3.12-slim

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory inside container
WORKDIR /app

# System dependencies (for psycopg2, etc.)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for caching)
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# Set entrypoint that does setup, then executes command
ENTRYPOINT ["/docker-entrypoint.sh"]

# Copy entire backend code
COPY . /app/

# Expose port (Gunicorn will listen here)
EXPOSE 8000

# Start Gunicorn
CMD ["gunicorn", "skillhive.wsgi:application"]
