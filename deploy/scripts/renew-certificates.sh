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

docker compose -f "$COMPOSE_FILE" --env-file ./.env run --rm certbot renew --webroot -w /var/www/certbot
docker compose -f "$COMPOSE_FILE" --env-file ./.env exec nginx nginx -s reload

echo "Renovacao concluida e nginx recarregado."
