# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.23.4

FROM node:${NODE_VERSION} AS build

ARG DEPLOYMENT_ID

WORKDIR /repo

RUN corepack enable

COPY . .

RUN HUSKY=0 YARN_ENABLE_IMMUTABLE_INSTALLS=true yarn install --mode=skip-build

RUN yarn workspace @kids-reporter/logger build \
  && yarn workspace @kids-reporter/api-types build \
  && yarn workspace @kids-reporter/routing-ui build \
  && yarn workspace @kids-reporter/draft-renderer build \
  && DEPLOYMENT_ID=${DEPLOYMENT_ID} yarn workspace @kids-reporter/frontend build

FROM node:${NODE_VERSION}

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_MANUAL_SIG_HANDLE=true

COPY --from=build /repo/packages/frontend/.next/standalone ./
COPY --from=build /repo/packages/frontend/.next/static ./packages/frontend/.next/static
COPY --from=build /repo/packages/frontend/public ./packages/frontend/public

COPY --from=build /repo/packages/frontend/graceful-shutdown.cjs ./graceful-shutdown.cjs

CMD ["node", "--require", "./graceful-shutdown.cjs", "packages/frontend/server.js"]
