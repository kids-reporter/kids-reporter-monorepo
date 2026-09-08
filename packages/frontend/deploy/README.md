# Frontend Deployment

The root `cloudbuild.yaml` builds and deploys frontend. This directory owns
the environment-specific configuration and Secret Manager specification
consumed by that deployment.

The Cloud Build trigger must set `_ENV` to `dev`, `staging`, or `prod`. The
Cloud Run service name is derived as `${_ENV}-frontend`.

The internal preview variant is `${_ENV}-frontend-for-preview`, selected with
`_SERVICE_NAME=frontend-for-preview`. It uses the same runtime resources and
secrets, but points server-side content requests at the matching
`content-api-for-preview` service and deploys with internal ingress.

Frontend needs two categories of environment configuration, unlike this
repo's other services:

## Build Configuration

`NEXT_PUBLIC_*` vars are inlined into the client-side JavaScript bundle by
Next.js at `next build` time, so they must be present before the Docker
image is built — setting them at `gcloud run deploy` time would be too late.
These live in, and are copied to `.env.local` before `docker build`:

```text
deploy/env.dev.frontend.build
deploy/env.staging.frontend.build
deploy/env.prod.frontend.build
```

Dotenv format (`KEY=value`).

Preview builds use the existing `.env.preview.${_ENV}.public` files so
`NEXT_PUBLIC_IS_PREVIEW_MODE` is included in the browser bundle.

In dev and staging, browser requests to `{dev,staging}-kids-api.twreporter.org`
must go through this frontend's `/api-gateway` proxy route because those
domains are protected by IAP (Identity-Aware Proxy) at the GCP load
balancer — configuration outside this repo. Prod does not have IAP enabled,
so `NEXT_PUBLIC_API_GATEWAY_ENDPOINT` points directly at
`kids-api.twreporter.org` with no `/api-gateway` proxy hop.

## Runtime Configuration

Server-only vars (not exposed to the browser) are read at request time by
`src/environment-variables.ts` for server-side (SSR/RSC) calls to internal
Cloud Run services, and are supplied via `gcloud run deploy --env-vars-file`
like every other service in this repo:

```text
deploy/env.dev.frontend.runtime.yaml
deploy/env.staging.frontend.runtime.yaml
deploy/env.prod.frontend.runtime.yaml
deploy/env.dev.frontend-for-preview.public.yaml
deploy/env.staging.frontend-for-preview.public.yaml
deploy/env.prod.frontend-for-preview.public.yaml
```

YAML format (`KEY: value`).

`PORT` is provided by Cloud Run and is intentionally not managed in either
file. Passwords, connection strings, API keys, and session/encryption
secrets must not be added to either file — see `## Secrets` below.

## Secrets

Secret IDs follow this pattern:

```text
${ENV}-frontend_${secret-key}
```

Create or update secrets from `packages/frontend`:

```bash
ENV=dev ./deploy/secrets/create-secrets.sh --all
ENV=dev ./deploy/secrets/create-secrets.sh search-api-key
```

The script prompts for values interactively and grants the Cloud Run runtime
service account access to each secret.

## Rollout

Deploy and verify dev, then staging, then production. For each environment,
confirm the health check, that the site renders and navigates, that login
via the widget works, and that content loads through
`NEXT_PUBLIC_CONTENT_API_ENDPOINT`. Confirm the deployed service's build and
runtime variables, secret references, runtime service account, ingress, VPC
subnet, timeout, and service-level scaling before considering the rollout
complete.
