#!/usr/bin/env bash
# Собирает Angular-проект в Docker, монтируя внешнюю папку как /project.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${ROOT}/docker/angular-builder/compose.yml"

usage() {
  cat <<EOF
Использование: $(basename "$0") <путь-к-angular-проекту> [аргументы ng build...]

Примеры:
  $(basename "$0") /home/user/my-angular-app
  $(basename "$0") ../apps/frontend --source-map
  NG_CONFIGURATION=development $(basename "$0") /home/user/my-angular-app
  DOCKER_NETWORK=host $(basename "$0") /home/user/my-angular-app
EOF
}

if [[ $# -lt 1 || "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

PROJECT_PATH="$1"
shift

if [[ ! -d "$PROJECT_PATH" ]]; then
  echo "Ошибка: папка не найдена: ${PROJECT_PATH}" >&2
  exit 1
fi

if [[ ! -f "${PROJECT_PATH}/angular.json" ]]; then
  echo "Ошибка: ${PROJECT_PATH} не похож на Angular-проект (нет angular.json)" >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Ошибка: Docker не установлен или недоступен в PATH" >&2
  exit 1
fi

export ANGULAR_PROJECT_PATH="$(cd "$PROJECT_PATH" && pwd)"
export HOST_UID="${HOST_UID:-$(id -u)}"
export HOST_GID="${HOST_GID:-$(id -g)}"
export NG_CONFIGURATION="${NG_CONFIGURATION:-production}"

echo "Проект: ${ANGULAR_PROJECT_PATH}"
echo "Конфигурация: ${NG_CONFIGURATION}"

compose_files=(-f "$COMPOSE_FILE")
if [[ "${DOCKER_NETWORK:-}" == "host" ]]; then
  compose_files+=(-f "${ROOT}/docker/angular-builder/compose.host.yml")
elif [[ -n "${DOCKER_NETWORK:-}" ]]; then
  echo "Ошибка: поддерживается только DOCKER_NETWORK=host (или пустое значение)" >&2
  exit 1
fi

docker compose "${compose_files[@]}" build
docker compose "${compose_files[@]}" run --rm angular-builder build "$@"
