# Builder stage
FROM python:3.13-slim AS builder

WORKDIR /app

# Install necessary packages for building and certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    curl \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Download and install VA internal certificates
WORKDIR /usr/local/share/ca-certificates
RUN curl -OsS http://aia.pki.example.com/PKI/AIA/VA/VA-Internal-S2-ICA4.cer && \
    curl -OsS http://aia.pki.example.com/PKI/AIA/VA/VA-Internal-S2-ICA11.cer && \
    curl -OsS http://aia.pki.example.com/PKI/AIA/VA/VA-Internal-S2-RCA1-v1.cer && \
    curl -OsS http://aia.pki.example.com/PKI/AIA/VA/VA-Internal-S2-RCA2.cer && \
    curl -OsS http://aia.pki.example.com/PKI/AIA/VA/VA-Internal-S2-RCA3.cer && \
    # Convert certificates from DER to PEM format
    for cert in *.cer; do \
        openssl x509 -inform DER -in "$cert" -out "${cert%.cer}.crt" 2>/dev/null || \
        openssl x509 -inform PEM -in "$cert" -out "${cert%.cer}.crt"; \
    done && \
    rm *.cer && \
    # Create symlinks in /etc/ssl/certs
    for cert in *.crt; do \
        hash=$(openssl x509 -hash -noout -in "$cert").0 && \
        cp "$cert" "/etc/ssl/certs/${cert%.crt}.pem" && \
        ln -sf "/etc/ssl/certs/${cert%.crt}.pem" "/etc/ssl/certs/$hash"; \
    done && \
    update-ca-certificates --fresh && \
    # Verify certificates were properly installed
    ls -la /etc/ssl/certs/VA-Internal-S2-*.pem

# Set SSL environment variables
ENV CURL_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt \
    SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt \
    REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt \
    HTTPX_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files and README
COPY pyproject.toml README.md ./

# Install dependencies
RUN uv pip install --system -e .

# Install/upgrade certifi and link certificates
RUN uv pip install --system --upgrade certifi && \
    # Export the certifi path for later use
    python -c "import certifi; print(certifi.where())" > /tmp/certifi_path.txt && \
    export CERTIFI_PATH=$(cat /tmp/certifi_path.txt) && \
    # Backup original certifi bundle
    cp "$CERTIFI_PATH" "${CERTIFI_PATH}.backup" && \
    # Replace with system certificates that include VA certs
    cp /etc/ssl/certs/ca-certificates.crt "$CERTIFI_PATH"

# Runtime stage
FROM python:3.13-slim AS runtime

WORKDIR /app

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy CA certificates from builder stage
COPY --from=builder /usr/local/share/ca-certificates/ /usr/local/share/ca-certificates/
COPY --from=builder /etc/ssl/certs/VA-Internal-S2-*.pem /etc/ssl/certs/
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Update certificate store
RUN update-ca-certificates

# Set SSL environment variables for runtime
ENV CURL_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt \
    SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt \
    REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt \
    HTTPX_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Copy uv from builder
COPY --from=builder /usr/local/bin/uv /usr/local/bin/uv

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Create non-root user for security
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8080

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]