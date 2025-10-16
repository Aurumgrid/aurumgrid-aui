# Monitoring Stack TLS Configuration

This component provides a script and configuration files to enable end-to-end TLS encryption for a monitoring stack (Grafana, Prometheus, Alertmanager) running behind Tor.

## Files

- `generate-certs.sh`: An executable script that automates the creation of self-signed TLS certificates for Grafana, Prometheus, and Alertmanager. It creates a `-secrets` directory for each service to store the generated `.key` and `.crt` files.

- `web-config.yml`: A configuration file for Prometheus that tells it where to find the TLS certificate and key.

- `docker-compose.override.yml`: An example Docker Compose override file that demonstrates how to mount the generated certificates and keys into the respective service containers and configure them to use HTTPS.

## Usage

1. **Generate Certificates:**
   Run the `generate-certs.sh` script from within this directory:
   ```bash
   ./generate-certs.sh
   ```
   This will create the `grafana-secrets`, `prometheus-secrets`, and `alertmanager-secrets` directories with the necessary TLS files.

2. **Apply Configuration:**
   Use the `docker-compose.override.yml` as a reference to update your main Docker Compose file for your monitoring stack. The key steps are:
   - Mount the certificate and key files into each service's container as read-only volumes.
   - Set the necessary environment variables (for Grafana) or command-line flags (for Prometheus/Alertmanager) to enable TLS.

3. **Restart Services:**
   After updating your Docker Compose configuration, restart your monitoring stack to apply the changes.
