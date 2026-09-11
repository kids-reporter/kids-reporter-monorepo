FROM node:20.19.5-slim

RUN corepack enable

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends \
      build-essential \
      ca-certificates \
      tini \
      openssl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ENV APP_DIR /app
ENV HOST 0.0.0.0
ENV PORT 3000

RUN mkdir -p $APP_DIR

WORKDIR $APP_DIR

COPY . $APP_DIR

## Install application dependencies
RUN SKIP_BUILD_DEPS=true yarn install && yarn cache clean --all

## Build application bundles
RUN yarn build

## Ensure the script is executable
RUN chmod +x run.sh

EXPOSE 3000

## Use tini to manage zombie processes and signal forwarding
## https://github.com/krallin/tini
ENTRYPOINT ["/usr/bin/tini", "--"]

## Pass the startup script as arguments to Tini
CMD [ "/app/run.sh"]
