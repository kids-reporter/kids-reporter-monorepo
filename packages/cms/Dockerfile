# syntax=docker/dockerfile:1

FROM node:22.23.4-slim AS build

ENV APP_DIR=/app

WORKDIR $APP_DIR

RUN corepack enable

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends \
      build-essential \
      ca-certificates \
      openssl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN HUSKY=0 YARN_ENABLE_IMMUTABLE_INSTALLS=true yarn install --mode=skip-build

RUN yarn workspace @kids-reporter/logger build \
  && yarn workspace @kids-reporter/draft-renderer build \
  && yarn workspace @kids-reporter/draft-editor build \
  && yarn workspace @kids-reporter/cms-core build \
  && SKIP_BUILD_DEPS=true yarn workspace @kids-reporter/cms postinstall \
  && yarn workspace @kids-reporter/cms build

FROM node:22.23.4-slim AS runner

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends \
      ca-certificates \
      tini \
      openssl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ENV APP_DIR=/app
ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR $APP_DIR

RUN corepack enable && corepack prepare yarn@4.9.4 --activate

COPY package.json yarn.lock .yarnrc.yml $APP_DIR/
COPY --from=build $APP_DIR/node_modules ./node_modules
COPY --from=build $APP_DIR/packages/logger ./packages/logger
COPY --from=build $APP_DIR/packages/draft-renderer ./packages/draft-renderer
COPY --from=build $APP_DIR/packages/draft-editor ./packages/draft-editor
COPY --from=build $APP_DIR/packages/core ./packages/core
COPY --from=build $APP_DIR/packages/cms ./packages/cms

RUN chmod +x packages/cms/run.sh

WORKDIR $APP_DIR/packages/cms

EXPOSE 3000

ENTRYPOINT ["/usr/bin/tini", "--"]

CMD ["/app/packages/cms/run.sh"]
