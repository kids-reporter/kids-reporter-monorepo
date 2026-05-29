ARG NODE_VERSION=20.19.5

FROM node:${NODE_VERSION} AS build

RUN corepack enable

WORKDIR /build

# Cloud Build stages this package dir (lockfile copied from repo root; see cloudbuild.yaml).
# No Makefile in lean COPY: this package has no postinstall hook.
COPY package.json yarn.lock .yarnrc.yml /build/

RUN yarn install

# Preserve the post-install lockfile from being overwritten by the build context copy.
RUN cp /build/yarn.lock /tmp/yarn.lock.bak
COPY . /build/
RUN mv /tmp/yarn.lock.bak /build/yarn.lock

RUN yarn build


FROM node:${NODE_VERSION}

RUN corepack enable

WORKDIR /app

ENV NODE_ENV=production

# Automatically leverage output traces to reduce image size
COPY --from=build /build/node_modules ./node_modules
COPY --from=build /build/dist ./dist
COPY --from=build /build/package.json ./package.json

CMD ["node", "dist/server.js"]
