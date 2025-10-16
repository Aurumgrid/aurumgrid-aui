#!/bin/bash
set -e

# Function to generate a self-signed certificate for a service
generate_cert() {
  local service_name=$1
  local onion_hostname=$2
  local secrets_dir="${service_name}-secrets"

  echo "--- Generating certificate for ${service_name} ---"

  # Create directory for secrets
  mkdir -p "$secrets_dir"
  echo "Created directory: $secrets_dir"

  # Generate private key
  openssl genrsa -out "${secrets_dir}/${service_name}.key" 2048
  echo "Generated private key: ${secrets_dir}/${service_name}.key"

  # Generate CSR
  openssl req -new -key "${secrets_dir}/${service_name}.key" \
    -out "${secrets_dir}/${service_name}.csr" \
    -subj "/CN=${onion_hostname}/O=SuperStack Tor/OU=Monitoring"
  echo "Generated CSR: ${secrets_dir}/${service_name}.csr"

  # Generate self-signed certificate
  openssl x509 -req -days 365 \
    -in "${secrets_dir}/${service_name}.csr" \
    -signkey "${secrets_dir}/${service_name}.key" \
    -out "${secrets_dir}/${service_name}.crt"
  echo "Generated self-signed certificate: ${secrets_dir}/${service_name}.crt"

  # Clean up the CSR file
  rm "${secrets_dir}/${service_name}.csr"
  echo "Cleaned up CSR file."
  echo "--- Done for ${service_name} ---"
  echo
}

# Generate certs for all services
generate_cert "grafana" "abc-grafana.onion"
generate_cert "prometheus" "abc-prometheus.onion"
generate_cert "alertmanager" "abc-alertmanager.onion"

echo "All certificates generated successfully."
