#!/usr/bin/env bash
set -Eeuo pipefail

BRANCH="${1:-main}"
BASE_DIR="${BASE_DIR:-/opt/jmfitness}"
BACKEND_DIR="${BACKEND_DIR:-$BASE_DIR/backend}"
FRONTEND_DIR="${FRONTEND_DIR:-$BASE_DIR/frontend}"
DEPLOY_DIR="${DEPLOY_DIR:-$FRONTEND_DIR/deploy}"
COMPOSE_FILE="${COMPOSE_FILE:-$DEPLOY_DIR/docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-$DEPLOY_DIR/.env}"

ALLOW_DIRTY="${ALLOW_DIRTY:-0}"
RUN_MIGRATIONS="${RUN_MIGRATIONS:-0}"
ROLLBACK_ON_FAIL="${ROLLBACK_ON_FAIL:-1}"

PREV_BACKEND_COMMIT=""
PREV_FRONTEND_COMMIT=""
ROLLBACK_IN_PROGRESS=0
ROLLBACK_DONE=0

log() {
  echo "[$(date '+%F %T')] $*"
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Comando nao encontrado: $1"
    exit 1
  }
}

require_path() {
  [[ -e "$1" ]] || {
    echo "Caminho nao encontrado: $1"
    exit 1
  }
}

ensure_clean_repo() {
  local repo="$1"
  if [[ "$ALLOW_DIRTY" != "1" ]] && [[ -n "$(git -C "$repo" status --porcelain)" ]]; then
    echo "Repositorio com alteracoes locais: $repo"
    echo "Commit/stash/reverta antes de deploy ou rode com ALLOW_DIRTY=1"
    exit 1
  fi
}

checkout_branch() {
  local repo="$1"
  if git -C "$repo" show-ref --verify --quiet "refs/heads/$BRANCH"; then
    git -C "$repo" checkout "$BRANCH"
    return
  fi

  if git -C "$repo" ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
    git -C "$repo" checkout -b "$BRANCH" "origin/$BRANCH"
    return
  fi

  echo "Branch '$BRANCH' nao encontrada em $repo."
  exit 1
}

update_repo() {
  local repo="$1"
  local label="$2"

  log "Atualizando $label em $repo (branch: $BRANCH)"
  ensure_clean_repo "$repo"
  git -C "$repo" fetch --prune origin
  checkout_branch "$repo"
  git -C "$repo" pull --ff-only origin "$BRANCH"
}

show_runtime_logs() {
  if [[ -f "$COMPOSE_FILE" && -f "$ENV_FILE" ]]; then
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs --tail=150 backend frontend nginx || true
  fi
}

rollback() {
  if [[ "$ROLLBACK_ON_FAIL" != "1" ]]; then
    log "Rollback automatico desativado (ROLLBACK_ON_FAIL=0)."
    return
  fi
  if [[ "$ROLLBACK_IN_PROGRESS" == "1" || "$ROLLBACK_DONE" == "1" ]]; then
    return
  fi

  ROLLBACK_IN_PROGRESS=1
  log "Iniciando rollback para commits anteriores..."

  if [[ -n "$PREV_BACKEND_COMMIT" ]]; then
    log "Rollback backend -> $PREV_BACKEND_COMMIT"
    git -C "$BACKEND_DIR" checkout "$BRANCH" || true
    git -C "$BACKEND_DIR" reset --hard "$PREV_BACKEND_COMMIT"
  fi

  if [[ -n "$PREV_FRONTEND_COMMIT" ]]; then
    log "Rollback frontend -> $PREV_FRONTEND_COMMIT"
    git -C "$FRONTEND_DIR" checkout "$BRANCH" || true
    git -C "$FRONTEND_DIR" reset --hard "$PREV_FRONTEND_COMMIT"
  fi

  if [[ -f "$COMPOSE_FILE" && -f "$ENV_FILE" ]]; then
    log "Reconstruindo stack apos rollback..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build --remove-orphans
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
  fi

  ROLLBACK_DONE=1
  ROLLBACK_IN_PROGRESS=0
  log "Rollback concluido."
}

on_error() {
  local exit_code="$1"
  log "Erro durante deploy (exit code $exit_code)."
  show_runtime_logs
  rollback
  exit "$exit_code"
}

trap 'on_error $?' ERR

main() {
  require_cmd git
  require_cmd docker
  require_path "$BACKEND_DIR/.git"
  require_path "$FRONTEND_DIR/.git"
  require_path "$COMPOSE_FILE"
  require_path "$ENV_FILE"

  PREV_BACKEND_COMMIT="$(git -C "$BACKEND_DIR" rev-parse HEAD)"
  PREV_FRONTEND_COMMIT="$(git -C "$FRONTEND_DIR" rev-parse HEAD)"
  log "Commit backend atual:  $PREV_BACKEND_COMMIT"
  log "Commit frontend atual: $PREV_FRONTEND_COMMIT"

  update_repo "$BACKEND_DIR" "backend"
  update_repo "$FRONTEND_DIR" "frontend"

  local next_backend_commit
  local next_frontend_commit
  next_backend_commit="$(git -C "$BACKEND_DIR" rev-parse HEAD)"
  next_frontend_commit="$(git -C "$FRONTEND_DIR" rev-parse HEAD)"
  log "Novo commit backend:  $next_backend_commit"
  log "Novo commit frontend: $next_frontend_commit"

  if [[ "$RUN_MIGRATIONS" == "1" ]]; then
    require_cmd pnpm
    log "Instalando dependencias backend para migracoes..."
    (
      cd "$BACKEND_DIR"
      pnpm install --frozen-lockfile
      pnpm run db:migrate
    )
  fi

  log "Subindo stack de producao..."
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build --remove-orphans

  log "Status dos servicos:"
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

  log "Ultimos logs:"
  show_runtime_logs

  log "Deploy concluido com sucesso."
}

main "$@"
