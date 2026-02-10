#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-./docker-compose.prod.yml}"
if [[ -f ./.env ]]; then
  set -a
  source ./.env
  set +a
fi
DOMAIN="${DOMAIN:-jmfitnessstudio.com.com}"
WWW_DOMAIN="${WWW_DOMAIN:-www.jmfitnessstudio.com.com}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-}"

if [[ -z "$LETSENCRYPT_EMAIL" ]]; then
  echo "Defina LETSENCRYPT_EMAIL antes de emitir o certificado."
  exit 1
fi

echo "Subindo stack (nginx com certificado temporario)..."
docker compose -f "$COMPOSE_FILE" up -d nginx frontend backend

echo "Emitindo certificado para $DOMAIN e $WWW_DOMAIN..."
docker compose -f "$COMPOSE_FILE" run --rm certbot certonly \
  --webroot \
  -w /var/www/certbot \
  --email "$LETSENCRYPT_EMAIL" \
  -d "$DOMAIN" \
  -d "$WWW_DOMAIN" \
  --rsa-key-size 4096 \
  --agree-tos \
  --non-interactive

echo "Recarregando nginx com certificado Let's Encrypt..."
docker compose -f "$COMPOSE_FILE" exec nginx nginx -s reload

echo "Certificado emitido com sucesso."
