ARG NODE_VERSION=20.19.5

FROM node:${NODE_VERSION} AS build

ARG DEPLOYMENT_ID
ARG USE_CONTENT_API

RUN corepack enable

WORKDIR /build

# copy from root at build time (in cloudbuild.yaml)
COPY package.json yarn.lock .yarnrc.yml /build/

RUN yarn install --immutable --ignore-scripts

COPY . /build/

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
