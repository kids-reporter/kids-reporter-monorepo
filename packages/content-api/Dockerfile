# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.23.4

FROM node:${NODE_VERSION} AS build

WORKDIR /app

RUN corepack enable

COPY . .

RUN HUSKY=0 YARN_ENABLE_IMMUTABLE_INSTALLS=true yarn install --mode=skip-build

RUN yarn workspace @kids-reporter/logger build \
  && yarn workspace @kids-reporter/api-types build \
  && yarn workspace @kids-reporter/db build \
  && yarn workspace @kids-reporter/content-api-kit build \
  && yarn workspace @kids-reporter/content-api build

FROM node:${NODE_VERSION}

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/logger ./packages/logger
COPY --from=build /app/packages/api-types ./packages/api-types
COPY --from=build /app/packages/db ./packages/db
COPY --from=build /app/packages/content-api-kit ./packages/content-api-kit
COPY --from=build /app/packages/content-api ./packages/content-api

WORKDIR /app/packages/content-api

CMD ["node", "dist/server.js"]
