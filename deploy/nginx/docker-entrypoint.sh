#!/bin/sh
set -eu

DOMAIN="${DOMAIN:-jmfitnessstudio.com.br}"
WWW_DOMAIN="${WWW_DOMAIN:-www.jmfitnessstudio.com.br}"
CERT_DIR="/etc/letsencrypt/live/$DOMAIN"
FULLCHAIN="$CERT_DIR/fullchain.pem"
PRIVKEY="$CERT_DIR/privkey.pem"

envsubst '${DOMAIN} ${WWW_DOMAIN}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

if [ ! -f "$FULLCHAIN" ] || [ ! -f "$PRIVKEY" ]; then
  mkdir -p "$CERT_DIR"
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout "$PRIVKEY" \
    -out "$FULLCHAIN" \
    -subj "/CN=$DOMAIN"
fi

exec nginx -g "daemon off;"
