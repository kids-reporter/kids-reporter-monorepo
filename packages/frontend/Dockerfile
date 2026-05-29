ARG NODE_VERSION=20.19.5

FROM node:${NODE_VERSION} AS build

ARG DEPLOYMENT_ID
ARG USE_CONTENT_API

RUN corepack enable

WORKDIR /build

# Cloud Build stages this package dir (lockfile, schema.graphql, graphql docs; see cloudbuild.yaml).
# Makefile must exist before install: postinstall runs `make postinstall` (codegen, etc.).
COPY package.json yarn.lock .yarnrc.yml Makefile /build/

RUN SKIP_BUILD_DEPS=true SKIP_CODEGEN_LOCAL=true yarn install --mode=skip-build

# Preserve the post-install lockfile from being overwritten by the build context copy.
RUN cp /build/yarn.lock /tmp/yarn.lock.bak
COPY . /build/
RUN mv /tmp/yarn.lock.bak /build/yarn.lock

RUN DEPLOYMENT_ID=${DEPLOYMENT_ID} NEXT_PUBLIC_USE_CONTENT_API=${USE_CONTENT_API} yarn build:cloudbuild

FROM node:${NODE_VERSION}

RUN corepack enable

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /build/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=build /build/.next/standalone ./
COPY --from=build /build/.next/static ./.next/static

CMD ["node", "server.js"]
