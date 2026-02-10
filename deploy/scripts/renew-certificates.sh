#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-./docker-compose.prod.yml}"
if [[ -f ./.env ]]; then
  set -a
  source ./.env
  set +a
fi

docker compose -f "$COMPOSE_FILE" run --rm certbot renew --webroot -w /var/www/certbot
docker compose -f "$COMPOSE_FILE" exec nginx nginx -s reload

echo "Renovacao concluida e nginx recarregado."
