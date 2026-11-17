# syntax=docker/dockerfile:1

FROM node:22.23.4-alpine

RUN corepack enable && corepack prepare yarn@4.9.4 --activate

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY --parents ./packages/*/package.json ./

RUN YARN_ENABLE_IMMUTABLE_INSTALLS=true \
  yarn workspaces focus @kids-reporter/image-resizer

COPY packages/image-resizer packages/image-resizer

WORKDIR /app/packages/image-resizer

CMD ["yarn", "start"]
