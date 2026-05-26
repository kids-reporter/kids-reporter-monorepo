ARG NODE_VERSION=20.19.5

FROM node:${NODE_VERSION} AS build

RUN corepack enable

WORKDIR /build

# Cloud Build stages this package dir (lockfile copied from repo root; see cloudbuild.yaml).
# Makefile must exist before install: postinstall runs `make postinstall` (db-generate, etc.).
COPY package.json yarn.lock .yarnrc.yml Makefile /build/

RUN SKIP_BUILD_DEPS=true DB_GENERATE_LOCAL=false yarn install

COPY . /build/

# Relink workspace deps after source copy, then build.
RUN SKIP_BUILD_DEPS=true DB_GENERATE_LOCAL=false yarn install && yarn build

FROM node:${NODE_VERSION}

RUN corepack enable

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /build/node_modules ./node_modules
COPY --from=build /build/dist ./dist
COPY --from=build /build/package.json ./package.json

CMD ["node", "dist/server.js"]
