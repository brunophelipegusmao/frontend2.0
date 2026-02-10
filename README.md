# Frontend JM Fitness (Next.js)

Frontend em Next.js (App Router) do projeto JM Fitness.

## Requisitos

- Node 20+
- pnpm

## Rodar local

```bash
pnpm install
pnpm dev
```

App local: `http://localhost:3000`

## Build de produção local

```bash
pnpm build
pnpm start
```

## PWA (Instalável)

Implementação PWA feita no frontend com:

- `public/manifest.webmanifest`
- ícones em `public/images/`
- service worker em `public/sw.js`
- registro do SW em `src/components/PWA/ServiceWorkerRegister.tsx`
- botão de instalação em `src/components/PWA/InstallAppButton.tsx`

### Arquivos de ícone

Troque estes arquivos pelos definitivos quando quiser atualizar a marca:

- `public/images/icon-wt.png`
- `public/images/adaptive-icon.png`
- `public/images/splash-icon.png`

## Como testar PWA localmente

1. Rode em modo produção local:

```bash
pnpm build
pnpm start
```

2. Abra `http://localhost:3000` no Chrome.
3. Abra DevTools -> Application:
- confira `Manifest`
- confira `Service Workers` (registrado e ativo)

Observação: Chrome permite PWA em `localhost` mesmo sem HTTPS.

## Como auditar com Lighthouse

1. Com `pnpm start` rodando, abra o site no Chrome.
2. DevTools -> Lighthouse.
3. Gere relatório com categoria `PWA`.
4. Verifique itens de Installability e Service Worker.

## Teste de instalação Android (Chrome)

1. Acesse a URL HTTPS de produção (ou localhost para teste local).
2. O navegador deve exibir opção de instalar (menu do Chrome).
3. O botão `Instalar app` aparece no site quando `beforeinstallprompt` estiver disponível.
4. Após instalar, abra o app e confirme modo standalone.

## Teste iOS (Safari)

Safari no iOS não suporta `beforeinstallprompt`.

1. Abra a URL HTTPS no Safari.
2. Toque em `Compartilhar`.
3. Toque em `Adicionar à Tela de Início`.
4. Confira ícone e abertura em tela cheia.

## Observações de cache

Estratégia de cache do SW é conservadora:

- navegação: `network-first` com fallback de shell
- estáticos do app: `stale-while-revalidate`
- chamadas ao backend não são cacheadas pelo SW

Quando precisar limpar totalmente:

1. Remova o app instalado.
2. No navegador, limpe `Site data`/`Storage`.
3. Reabra o site para novo registro do SW.

## Notas sobre backend

Nenhuma alteração no backend é obrigatória para esta implementação PWA.

Recomendado em produção:

- Servir frontend em HTTPS.
- Evitar mixed content (frontend HTTPS chamando backend HTTP).

## Deploy produção (Hostinger VPS + Docker Compose + Nginx + Certbot)

Este setup usa:

- `Dockerfile` no frontend e no backend para construir as imagens.
- `docker-compose.prod.yml` para orquestrar os serviços.
- `Nginx` como reverse proxy.
- `Certbot` para HTTPS (Let's Encrypt).

Arquivos do setup:

- `deploy/docker-compose.prod.yml`
- `deploy/nginx/default.conf.template`
- `deploy/nginx/Dockerfile`
- `deploy/nginx/docker-entrypoint.sh`
- `deploy/scripts/issue-certificates.sh`
- `deploy/scripts/renew-certificates.sh`
- `deploy/.env.example`
- `deploy/env/backend.env.example`

### 1. Preparar VPS

Pré-requisito: Ubuntu com Docker e Docker Compose plugin já instalados.

Clone os dois repositórios (separados), preferencialmente como pastas irmãs:

```bash
mkdir -p /opt/jmfitness
cd /opt/jmfitness
git clone https://github.com/brunophelipegusmao/frontend2.0.git frontend
git clone https://github.com/brunophelipegusmao/backend-jm2.0.git backend
```

Entre no frontend:

```bash
cd /opt/jmfitness/frontend
```

No arquivo `deploy/.env`, ajuste `BACKEND_REPO_PATH` se o backend não estiver em `/opt/jmfitness/backend`.

### 2. Configurar variáveis

```bash
cd deploy
cp .env.example .env
cp env/backend.env.example env/backend.env
```

Edite:

- `deploy/.env`
- `deploy/env/backend.env`

Campos críticos:

- `LETSENCRYPT_EMAIL`
- `NEXT_PUBLIC_API_URL=https://jmfitnessstudio.com.com/api`
- `BETTER_AUTH_URL=https://jmfitnessstudio.com.com`
- `FRONTEND_URL=https://jmfitnessstudio.com.com,https://www.jmfitnessstudio.com.com`
- credenciais reais (`DATABASE_URL`, Google, Cloudinary, etc.)

### 3. DNS (obrigatório antes do Certbot)

Crie registros DNS:

- `A` para `jmfitnessstudio.com.com` apontando para IP da VPS
- `A` para `www.jmfitnessstudio.com.com` apontando para IP da VPS

Valide:

```bash
dig +short jmfitnessstudio.com.com
dig +short www.jmfitnessstudio.com.com
```

### 4. Subir stack e emitir HTTPS

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
./scripts/issue-certificates.sh
```

Esse script:

- sobe nginx/frontend/backend
- emite certificado para `jmfitnessstudio.com.com` e `www.jmfitnessstudio.com.com`
- recarrega o nginx com o certificado válido

### 5. Renovação automática

Adicione no `crontab` do host:

```bash
0 3 * * * cd /opt/jmfitness/frontend/deploy && docker compose -f docker-compose.prod.yml --env-file .env run --rm certbot renew --webroot -w /var/www/certbot && docker compose -f docker-compose.prod.yml --env-file .env exec -T nginx nginx -s reload
```

### 6. Checklist pós-deploy

- `https://jmfitnessstudio.com.com` abre sem aviso de certificado
- `https://www.jmfitnessstudio.com.com` abre sem aviso de certificado
- login funciona
- chamadas para API usam `/api/*` (mesmo domínio)
- dashboard e check-in funcionando

### Hardening básico aplicado

- TLS 1.2/1.3
- redirecionamento HTTP -> HTTPS
- headers de segurança no nginx
- `trust proxy` no backend
- CORS do backend aceitando múltiplas origens via `FRONTEND_URL` separado por vírgula
