#!/bin/sh
set -eu

DOMAIN="${DOMAIN:-jmfitnessstudio.com.br}"
WWW_DOMAIN="${WWW_DOMAIN:-www.jmfitnessstudio.com.br}"
LE_CERT_DIR="/etc/letsencrypt/live/$DOMAIN"
LE_FULLCHAIN="$LE_CERT_DIR/fullchain.pem"
LE_PRIVKEY="$LE_CERT_DIR/privkey.pem"
SSL_CERT_PATH="$LE_FULLCHAIN"
SSL_KEY_PATH="$LE_PRIVKEY"

if [ ! -f "$LE_FULLCHAIN" ] || [ ! -f "$LE_PRIVKEY" ]; then
  FALLBACK_CERT_DIR="/etc/nginx/selfsigned"
  SSL_CERT_PATH="$FALLBACK_CERT_DIR/$DOMAIN-fullchain.pem"
  SSL_KEY_PATH="$FALLBACK_CERT_DIR/$DOMAIN-privkey.pem"
  mkdir -p "$FALLBACK_CERT_DIR"
  if [ ! -f "$SSL_CERT_PATH" ] || [ ! -f "$SSL_KEY_PATH" ]; then
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
      -keyout "$SSL_KEY_PATH" \
      -out "$SSL_CERT_PATH" \
      -subj "/CN=$DOMAIN"
  fi
fi

export DOMAIN WWW_DOMAIN SSL_CERT_PATH SSL_KEY_PATH
envsubst '${DOMAIN} ${WWW_DOMAIN} ${SSL_CERT_PATH} ${SSL_KEY_PATH}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g "daemon off;"
