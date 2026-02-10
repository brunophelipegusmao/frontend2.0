#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-./docker-compose.prod.yml}"
if [[ ! -f ./.env ]]; then
  echo "Arquivo .env nao encontrado em $(pwd)."
  echo "Crie com: cp .env.example .env"
  exit 1
fi

set -a
source ./.env
set +a

DOMAIN="${DOMAIN:-jmfitnessstudio.com.br}"
WWW_DOMAIN="${WWW_DOMAIN:-www.jmfitnessstudio.com.br}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-}"

if [[ -z "$LETSENCRYPT_EMAIL" ]]; then
  echo "Defina LETSENCRYPT_EMAIL antes de emitir o certificado."
  exit 1
fi

echo "Subindo stack (nginx com certificado temporario)..."
docker compose -f "$COMPOSE_FILE" --env-file ./.env up -d nginx frontend backend

echo "Limpando configuracao de renovacao quebrada (se existir)..."
docker compose -f "$COMPOSE_FILE" --env-file ./.env run --rm certbot sh -lc \
  "f='/etc/letsencrypt/renewal/$DOMAIN.conf'; if [ -f \"\$f\" ] && ! grep -q '^fullchain = ' \"\$f\"; then rm -f \"\$f\"; fi"

echo "Emitindo certificado para $DOMAIN e $WWW_DOMAIN..."
docker compose -f "$COMPOSE_FILE" --env-file ./.env run --rm certbot certonly \
  --webroot \
  -w /var/www/certbot \
  --cert-name "$DOMAIN" \
  --email "$LETSENCRYPT_EMAIL" \
  -d "$DOMAIN" \
  -d "$WWW_DOMAIN" \
  --expand \
  --keep-until-expiring \
  --rsa-key-size 4096 \
  --agree-tos \
  --non-interactive

echo "Reiniciando nginx para aplicar certificado Let's Encrypt..."
docker compose -f "$COMPOSE_FILE" --env-file ./.env restart nginx

echo "Certificado emitido com sucesso."
