# Сборка Angular через Docker

Образ не содержит исходников приложения. Любой Angular-проект подаётся **внешней папкой**: она монтируется в `/project`, сборка идёт внутри контейнера, готовый `dist` записывается обратно в эту же папку.

Так можно собирать проекты с Windows/macOS, не смешивая их `node_modules` с linux-зависимостями контейнера.

## Требования

- Docker и Docker Compose v2
- На хосте: корень Angular-проекта (`angular.json` + `package.json`)

Node.js и Angular CLI на хосте не нужны.

## Быстрый старт

Из корня репозитория `layouts-validator`:

```bash
./scripts/build-angular.sh /абсолютный/путь/к/angular-проекту
```

После успешной сборки артефакты появятся в:

```text
/абсолютный/путь/к/angular-проекту/dist
```

## Docker Compose

```bash
export ANGULAR_PROJECT_PATH=/абсолютный/путь/к/angular-проекту
docker compose -f docker/angular-builder/compose.yml build
docker compose -f docker/angular-builder/compose.yml run --rm angular-builder
```

Конфигурация Angular (по умолчанию `production`):

```bash
NG_CONFIGURATION=development ./scripts/build-angular.sh /путь/к/проекту
```

Дополнительные флаги `ng build`:

```bash
./scripts/build-angular.sh /путь/к/проекту --source-map --verbose
```

Если из контейнера не открывается `registry.npmjs.org` (часто при Docker без iptables), используйте сеть хоста:

```bash
DOCKER_NETWORK=host ./scripts/build-angular.sh /путь/к/проекту
```

Произвольная команда внутри рабочей копии проекта:

```bash
export ANGULAR_PROJECT_PATH=/путь/к/проекту
docker compose -f docker/angular-builder/compose.yml run --rm angular-builder npx ng version
```

## Переменные окружения

| Переменная | Значение по умолчанию | Назначение |
| --- | --- | --- |
| `ANGULAR_PROJECT_PATH` | — | Абсолютный путь к внешней папке проекта (обязательна) |
| `NG_CONFIGURATION` | `production` | Конфигурация `ng build` (если в проекте есть локальный CLI) |
| `BUILD_COMMAND` | пусто | Заменяет `ng build`, если сборка нестандартная |
| `SKIP_INSTALL` | `0` | `1` — не ставить зависимости |
| `HOST_OUTPUT_DIR` | `dist` | Куда скопировать артефакты на хосте |
| `HOST_UID` / `HOST_GID` | `1000` | Владелец файлов `dist` на хосте |
| `DOCKER_NETWORK` | (сеть Compose) | Например `host`, если npm-registry недоступен из bridge |

## Как это работает

1. Внешняя папка монтируется в контейнер как `/project`.
2. Исходники копируются в `/work` **без** `node_modules`, `dist`, `.angular` и `.git`.
3. Ставятся зависимости (`npm ci`, `yarn` или `pnpm` — по lock-файлу).
4. Запускается локальный CLI проекта: `npx ng build --configuration=...`.
5. Каталог `dist` копируется обратно во внешнюю папку.

Кэш npm хранится в Docker-томе `angular-builder-npm-cache`, поэтому повторные сборки быстрее.
