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
