# Frontend Deployment

The root `cloudbuild.yaml` builds and deploys frontend. This directory owns
the environment-specific configuration and Secret Manager specification
consumed by that deployment.

The Cloud Build trigger must set `_ENV` to `dev`, `staging`, or `prod`. The
Cloud Run service name is derived as `${_ENV}-frontend`.

The internal preview variant is `${_ENV}-frontend-for-preview`, selected with
`_SERVICE_NAME=frontend-for-preview`. It uses the same runtime resource settings and its own secrets, and points server-side content requests at the matching
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
deploy/env.dev.frontend-for-preview.build
deploy/env.staging.frontend-for-preview.build
deploy/env.prod.frontend-for-preview.build
```

Dotenv format (`KEY=value`).

Each preview build file contains the complete browser configuration for that
environment and sets `NEXT_PUBLIC_IS_PREVIEW_MODE=true`. Browser-side content
requests keep using the public content-api endpoint; server-side draft content
requests use the preview service configured in the runtime file.

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
deploy/env.dev.frontend-for-preview.runtime.yaml
deploy/env.staging.frontend-for-preview.runtime.yaml
deploy/env.prod.frontend-for-preview.runtime.yaml
```

YAML format (`KEY: value`).

`PORT` is provided by Cloud Run and is intentionally not managed in either
file. `SEARCH_ENGINE_ID` is a non-secret runtime identifier shared by normal
and preview services. Passwords, connection strings, API keys, and
session/encryption secrets must not be added to either file — see `## Secrets`
below.

## Secrets

Secret IDs follow the Cloud Run service name. Public and preview services
have separate secrets:

```text
${ENV}-frontend_${secret-key}
${ENV}-frontend-for-preview_${secret-key}
```

Create or update secrets from `packages/frontend`:

```bash
ENV=dev ./deploy/secrets/create-secrets.sh --all
ENV=dev SERVICE_NAME=frontend-for-preview ./deploy/secrets/create-secrets.sh --all
ENV=dev ./deploy/secrets/create-secrets.sh search-api-key
```

The script prompts for values interactively and grants the Cloud Run runtime
service account access to each secret.

SERVICE_NAME defaults to `frontend` and also accepts
`frontend-for-preview`. Both variants use the same secret specification,
but values are created and updated independently for each Cloud Run service.

Before deploying preview with these references, create its separate secrets
for the target environment (`dev`, `staging`, or `prod`) using the command
above with the appropriate `ENV`. Supply valid values for each credential;
separating Secret Manager resources does not require changing credentials
that must match another system. Existing public-service secrets remain in use
and must not be deleted. Creating a new secret version does not refresh
already-running revisions; redeploy the selected service after updates.

## Rollout

Deploy and verify dev, then staging, then production. For each environment,
confirm the health check, that the site renders and navigates, that login
via the widget works, and that content loads through
`NEXT_PUBLIC_CONTENT_API_ENDPOINT`. Confirm the deployed service's build and
runtime variables, secret references, runtime service account, ingress, VPC
subnet, timeout, and service-level scaling before considering the rollout
complete.
