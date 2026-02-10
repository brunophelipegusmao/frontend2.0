# Deploy de produção (Docker + Nginx + Certbot)

Este diretório assume a seguinte estrutura no servidor (repos separados):

```text
/opt/jmfitness
  ├── frontend  (este repositório)
  └── backend   (repositório backend-jm2.0)
```

## 1) Preparar variáveis

```bash
cd /opt/jmfitness/frontend/deploy
cp .env.example .env
cp env/backend.env.example env/backend.env
```

Edite os arquivos:

- `.env`
- `env/backend.env`

Se backend estiver em outro caminho, ajuste:

- `BACKEND_REPO_PATH` no `.env`

## 2) Subir containers

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

## 3) Emitir certificado HTTPS

```bash
./scripts/issue-certificates.sh
```

## 4) Renovação manual

```bash
./scripts/renew-certificates.sh
```

## 5) Renovação automática (cron)

```bash
0 3 * * * cd /opt/jmfitness/frontend/deploy && docker compose -f docker-compose.prod.yml --env-file .env run --rm certbot renew --webroot -w /var/www/certbot && docker compose -f docker-compose.prod.yml --env-file .env exec -T nginx nginx -s reload
```
