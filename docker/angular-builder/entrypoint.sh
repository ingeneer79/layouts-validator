#!/usr/bin/env bash
# Собирает Angular-проект, смонтированный в /project (внешняя папка хоста).
# Копия исходников живёт внутри контейнера, чтобы node_modules хоста
# (Windows/macOS) не ломали linux-сборку. Артефакты копируются обратно в /project/dist.
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/project}"
WORK_DIR="${WORK_DIR:-/work}"
NG_CONFIGURATION="${NG_CONFIGURATION:-production}"
HOST_OUTPUT_DIR="${HOST_OUTPUT_DIR:-dist}"

log() {
  printf '==> %s\n' "$*"
}

die() {
  printf 'Ошибка: %s\n' "$*" >&2
  exit 1
}

usage() {
  cat <<'EOF'
Сборка Angular-проекта через смонтированную внешнюю папку.

Ожидается, что корень проекта (с angular.json) примонтирован в /project.

Примеры:
  docker compose -f docker/angular-builder/compose.yml run --rm angular-builder
  ./scripts/build-angular.sh /путь/к/angular-проекту

Переменные окружения:
  NG_CONFIGURATION   конфигурация ng build (по умолчанию production)
  BUILD_COMMAND      произвольная команда сборки вместо ng build
  SKIP_INSTALL=1     не ставить зависимости (если они уже есть в копии)
  HOST_OUTPUT_DIR    каталог артефактов на хосте (по умолчанию dist)
  HOST_UID/HOST_GID  владелец файлов dist на хосте

Любая команда, кроме build, выполняется как есть в рабочей копии проекта:
  docker compose ... run --rm angular-builder npx ng version
EOF
}

require_project() {
  if [[ ! -d "$PROJECT_DIR" ]]; then
    die "каталог проекта не смонтирован: ${PROJECT_DIR}
Примонтируйте внешнюю папку с Angular-проектом в /project."
  fi

  if [[ ! -f "${PROJECT_DIR}/angular.json" ]]; then
    die "в ${PROJECT_DIR} нет angular.json — это не корень Angular-проекта.
Пример: ANGULAR_PROJECT_PATH=/home/user/my-app ./scripts/build-angular.sh"
  fi

  if [[ ! -f "${PROJECT_DIR}/package.json" ]]; then
    die "в ${PROJECT_DIR} нет package.json"
  fi
}

sync_sources() {
  mkdir -p "$WORK_DIR"
  log "Копирую исходники из ${PROJECT_DIR} в ${WORK_DIR}"
  rsync -a --delete \
    --exclude 'node_modules/' \
    --exclude 'dist/' \
    --exclude '.angular/' \
    --exclude '.git/' \
    --exclude '.nx/' \
    --exclude 'coverage/' \
    --exclude '.docker-node_modules/' \
    "${PROJECT_DIR}/" "${WORK_DIR}/"
}

install_dependencies() {
  if [[ "${SKIP_INSTALL:-0}" == "1" ]]; then
    log "SKIP_INSTALL=1 — установка зависимостей пропущена"
    return
  fi

  cd "$WORK_DIR"
  log "Устанавливаю зависимости"

  if [[ -f pnpm-lock.yaml ]]; then
    corepack enable
    corepack prepare pnpm@latest --activate
    pnpm install --frozen-lockfile
  elif [[ -f yarn.lock ]]; then
    corepack enable
    yarn install --frozen-lockfile
  elif [[ -f package-lock.json || -f npm-shrinkwrap.json ]]; then
    npm ci --no-audit --no-fund --loglevel=warn
  else
    npm install --no-audit --no-fund --loglevel=warn
  fi
}

run_ng_build() {
  cd "$WORK_DIR"

  if [[ -n "${BUILD_COMMAND:-}" ]]; then
    log "Запускаю BUILD_COMMAND: ${BUILD_COMMAND}"
    bash -lc "$BUILD_COMMAND"
    return
  fi

  local extra_args=("$@")

  if [[ -x node_modules/.bin/ng ]]; then
    log "ng build --configuration=${NG_CONFIGURATION} ${extra_args[*]:-}"
    if [[ ${#extra_args[@]} -gt 0 ]]; then
      npx ng build --configuration="$NG_CONFIGURATION" "${extra_args[@]}"
    else
      npx ng build --configuration="$NG_CONFIGURATION"
    fi
  elif grep -Eq '"build"[[:space:]]*:' package.json; then
    log "npm run build ${extra_args[*]:-}"
    if [[ ${#extra_args[@]} -gt 0 ]]; then
      npm run build -- "${extra_args[@]}"
    else
      npm run build
    fi
  else
    die "не найден локальный Angular CLI (node_modules/.bin/ng) и скрипт npm run build"
  fi
}

copy_artifacts() {
  local source_dist="${WORK_DIR}/dist"
  local dest_dist="${PROJECT_DIR}/${HOST_OUTPUT_DIR}"

  if [[ ! -d "$source_dist" ]]; then
    die "сборка завершилась, но каталог dist не появился в контейнере.
Если проект пишет артефакты в другое место, задайте BUILD_COMMAND или проверьте angular.json"
  fi

  log "Копирую артефакты в ${dest_dist}"
  rm -rf "$dest_dist"
  mkdir -p "$(dirname "$dest_dist")"
  cp -a "$source_dist" "$dest_dist"

  if [[ -n "${HOST_UID:-}" ]]; then
    chown -R "${HOST_UID}:${HOST_GID:-${HOST_UID}}" "$dest_dist"
  fi

  log "Готово: ${dest_dist}"
}

main() {
  if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
    usage
    exit 0
  fi

  require_project
  sync_sources
  install_dependencies

  if [[ $# -eq 0 || "${1:-}" == "build" ]]; then
    if [[ "${1:-}" == "build" ]]; then
      shift
    fi
    run_ng_build "$@"
    copy_artifacts
    return
  fi

  cd "$WORK_DIR"
  log "Выполняю команду: $*"
  exec "$@"
}

main "$@"
