# Универсальный образ для сборки любого Angular-проекта.
# Исходники в образ не копируются — проект монтируется внешней папкой в /project.
FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    git \
    python3 \
    make \
    g++ \
    rsync \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable

ENV NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false \
    NG_CLI_ANALYTICS=false \
    PROJECT_DIR=/project \
    WORK_DIR=/work

WORKDIR /work

COPY entrypoint.sh /usr/local/bin/angular-build-entrypoint
RUN chmod +x /usr/local/bin/angular-build-entrypoint

VOLUME ["/project", "/root/.npm"]

ENTRYPOINT ["angular-build-entrypoint"]
CMD ["build"]
