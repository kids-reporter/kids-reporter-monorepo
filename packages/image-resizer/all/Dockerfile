# syntax=docker/dockerfile:1

FROM node:22.23.4-alpine

RUN corepack enable && corepack prepare yarn@4.9.4 --activate

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY packages/image-resizer/all/package.json packages/image-resizer/all/package.json

RUN YARN_ENABLE_IMMUTABLE_INSTALLS=true \
  yarn workspaces focus image-resizer-all

COPY packages/image-resizer/all packages/image-resizer/all

WORKDIR /app/packages/image-resizer/all

CMD ["yarn", "start"]
