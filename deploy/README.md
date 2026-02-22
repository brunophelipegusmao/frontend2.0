# Deploy de produção (Docker + Nginx + Certbot)

Este diretório assume repos separados na VPS:

```text
/opt/jmfitness
  ├── frontend  (repo frontend2.0)
  └── backend   (repo backend-jm2.0)
```

## 1) Clonar os repositórios

```bash
mkdir -p /opt/jmfitness
cd /opt/jmfitness
git clone https://github.com/brunophelipegusmao/frontend2.0.git frontend
git clone https://github.com/brunophelipegusmao/backend-jm2.0.git backend
```

## 2) Preparar variáveis de deploy

```bash
cd /opt/jmfitness/frontend/deploy
cp .env.example .env
cp env/backend.env.example env/backend.env
```

Arquivos obrigatórios e seus locais:

- `/opt/jmfitness/frontend/deploy/.env` (variáveis do deploy e domínio)
- `/opt/jmfitness/frontend/deploy/env/backend.env` (variáveis da API)

Se backend estiver em outro caminho, ajuste no arquivo `deploy/.env`:

- `BACKEND_REPO_PATH`

## 3) DNS (antes do Certbot)

Configure no provedor DNS:

- `A` de `jmfitnessstudio.com.br` -> IP público da VPS
- `A` de `www.jmfitnessstudio.com.br` -> IP público da VPS

Remova `AAAA` se não estiver usando IPv6 na VPS.

Valide na VPS:

```bash
dig +short A jmfitnessstudio.com.br @1.1.1.1
dig +short A www.jmfitnessstudio.com.br @1.1.1.1
```

## 4) Subir stack

```bash
cd /opt/jmfitness/frontend/deploy
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

### Deploy unificado com rollback

O script `deploy/scripts/deploy-jm.sh` atualiza backend + frontend, reconstrói a stack e faz rollback automático para os commits anteriores em caso de erro.

Instalação na VPS (em `/root/deploy-jm.sh`):

```bash
cd /opt/jmfitness/frontend
install -m 750 deploy/scripts/deploy-jm.sh /root/deploy-jm.sh
```

Uso:

```bash
# deploy da main
/root/deploy-jm.sh

# deploy de outra branch
/root/deploy-jm.sh minha-branch

# deploy com migration
RUN_MIGRATIONS=1 /root/deploy-jm.sh
```

## 5) Emitir HTTPS (Let's Encrypt)

```bash
cd /opt/jmfitness/frontend/deploy
./scripts/issue-certificates.sh
```

O script:

- valida se `deploy/.env` existe
- sobe `nginx`, `frontend` e `backend`
- emite certificado com `cert-name` fixo no domínio principal
- reinicia o nginx para aplicar o novo certificado

## 6) Verificar certificado

```bash
curl -Iv https://jmfitnessstudio.com.br 2>&1 | grep -E "subject:|issuer:"
curl -Iv https://www.jmfitnessstudio.com.br 2>&1 | grep -E "subject:|issuer:"
```

## 7) Renovação manual

```bash
cd /opt/jmfitness/frontend/deploy
./scripts/renew-certificates.sh
```

## 8) Renovação automática (cron)

```bash
0 3 * * * cd /opt/jmfitness/frontend/deploy && docker compose -f docker-compose.prod.yml --env-file .env run --rm certbot renew --webroot -w /var/www/certbot && docker compose -f docker-compose.prod.yml --env-file .env exec -T nginx nginx -s reload
```

## 9) Troubleshooting rápido

- `couldn't find env file`: você não está em `/opt/jmfitness/frontend/deploy` ou não criou `deploy/.env`.
- erro de challenge no Certbot: DNS ainda não propagou para o IP da VPS.
- certificado inválido no navegador: valide `issuer` com `curl -Iv` e limpe cache DNS local.
