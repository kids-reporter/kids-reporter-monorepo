ARG NODE_VERSION=20.19.5

FROM node:${NODE_VERSION} AS build

ARG DEPLOYMENT_ID

RUN corepack enable

WORKDIR /build

COPY package.json yarn.lock .yarnrc.yml Makefile /build/

RUN SKIP_BUILD_DEPS=true yarn install --mode=skip-build

RUN cp /build/yarn.lock /tmp/yarn.lock.bak
COPY . /build/
RUN mv /tmp/yarn.lock.bak /build/yarn.lock

RUN DEPLOYMENT_ID=${DEPLOYMENT_ID} yarn build:cloudbuild

FROM node:${NODE_VERSION}

RUN corepack enable

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /build/public ./public

COPY --from=build /build/.next/standalone ./
COPY --from=build /build/.next/static ./.next/static

CMD ["node", "server.js"]
