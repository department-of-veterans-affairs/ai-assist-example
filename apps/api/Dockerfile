# Use VA hardened Python runtime as a parent image
FROM ghcr.io/department-of-veterans-affairs/cdsp-base-docker-images/python-base:3 AS builder

# Update CA certificates
USER root

# System dependencies (Alpine Linux based)
RUN apk add --no-cache \
    build-base \
    ca-certificates \
    libffi-dev \
    openssl \
    curl && \
    cd /usr/local/share/ca-certificates/ && \
    curl -OsS http://aia.pki.example.com/PKI/AIA/VA/VA-Internal-S2-ICA4.cer && \
    curl -OsS http://aia.pki.example.com/PKI/AIA/VA/VA-Internal-S2-ICA11.cer && \
    curl -OsS http://aia.pki.example.com/PKI/AIA/VA/VA-Internal-S2-RCA1-v1.cer && \
    curl -OsS http://aia.pki.example.com/PKI/AIA/VA/VA-Internal-S2-RCA2.cer && \
    curl -OsS http://aia.pki.example.com/PKI/AIA/VA/VA-Internal-S2-RCA3.cer && \
    for cert in *.cer; do \
    openssl x509 -inform DER -in "$cert" -out "${cert%.cer}.crt" 2>/dev/null || \
    openssl x509 -inform PEM -in "$cert" -out "${cert%.cer}.crt"; \
    done && \
    rm *.cer && \
    # Update CA certificates to include VA certs in bundle
    update-ca-certificates && \
    # Also copy to /etc/ssl/certs with .pem extension for compatibility
    for cert in *.crt; do \
    cp "$cert" "/etc/ssl/certs/${cert%.crt}.pem"; \
    done && \
    # Verify certificates were properly installed
    ls -la /etc/ssl/certs/VA-Internal-S2-*.pem && \
    grep -c "VA-Internal" /etc/ssl/certs/ca-certificates.crt || echo "Warning: VA certs may not be in bundle"

# Ensure curl uses the system certificate store
ENV CURL_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt \
    SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt

# Capture Python version information first
RUN python3 -c "import sys; print(f'Python version: {sys.version_info.major}.{sys.version_info.minor}')" && \
    PYTHON_VERSION=$(python3 -c "import sys; print(f'python{sys.version_info.major}.{sys.version_info.minor}')") && \
    echo "export PYTHON_VERSION=$PYTHON_VERSION" > /python_version.env && \
    echo "Python version captured as: $PYTHON_VERSION"

WORKDIR /app

# Install uv for package management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Add required files
COPY pyproject.toml README.md ./

# Set paths
ENV PATH="$PATH:/root/.local/bin" \
    PYTHONPATH="$PYTHONPATH:/app"

# Install dependencies using uv
RUN uv pip install --system -e .

# reinstalling certifi to get the .pem file and set REQUESTS_CA_BUNDLE
RUN uv pip install --system --upgrade certifi && \
    echo "export REQUESTS_CA_BUNDLE=$(python -c 'import certifi; print(certifi.where())')" >> /etc/environment

# Copy application code
COPY app/ ./app/

# Runtime stage
FROM builder AS runtime

USER root

# Copy version information
COPY --from=builder /python_version.env /python_version.env

# Copy CA certificates from builder stage
COPY --from=builder /usr/local/share/ca-certificates/ /usr/local/share/ca-certificates/
COPY --from=builder /etc/ssl/certs/VA-Internal-S2-*.pem /etc/ssl/certs/
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Load Python version
RUN . /python_version.env && \
    echo "Builder Python version: $PYTHON_VERSION"

# Runtime dependencies only
RUN apk update && apk --no-cache add \
    libffi \
    ca-certificates && \
    update-ca-certificates

# Set the working directory in the container
WORKDIR /app

# Set SSL environment variables for runtime
ENV CURL_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt \
    SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt \
    REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt \
    HTTPX_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Copy from builder
COPY --from=builder /app ./

# Copy Python packages
COPY --from=builder /usr/local/lib/python*/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run the application when the container launches as root
USER root
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]