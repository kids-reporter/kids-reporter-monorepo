# Content API Deployment

The root `cloudbuild.yaml` builds and deploys content-api. This directory
owns the environment-specific public configuration and Secret Manager
specification for both the public content-api service and its internal
preview variant.

The Cloud Build trigger must set `_ENV` to `dev`, `staging`, or `prod`.

- The public service name is derived as `${_ENV}-content-api`
  (`_TARGET_PACKAGE=content-api`, no `_SERVICE_NAME` override needed).
- The internal preview variant's service name is `${_ENV}-content-api-for-preview`,
  produced from the same `packages/content-api` directory by setting
  `_SERVICE_NAME=content-api-for-preview`.

## Public Configuration

Public environment variables are stored per service:

```text
deploy/env.dev.content-api.public.yaml
deploy/env.staging.content-api.public.yaml
deploy/env.prod.content-api.public.yaml
deploy/env.dev.content-api-for-preview.public.yaml
deploy/env.staging.content-api-for-preview.public.yaml
deploy/env.prod.content-api-for-preview.public.yaml
```

The preview variant differs in `IS_PREVIEW_SERVER: "true"` and internal
ingress (`--ingress internal`, set at deploy time in the root
`cloudbuild.yaml`). Never set `IS_PREVIEW_SERVER=true` on the public
content-api service.

`PORT` is provided by Cloud Run and is intentionally not managed here.
Passwords, connection strings, and JWT secrets must not be added to these
files — see `## Secrets` below.

## Secrets

Secret IDs follow the Cloud Run service name. Public and preview services
have separate secrets:

```text
${ENV}-content-api_${secret-key}
${ENV}-content-api-for-preview_${secret-key}
```

Create or update secrets from `packages/content-api`:

```bash
ENV=dev ./deploy/secrets/create-secrets.sh --all
ENV=dev SERVICE_NAME=content-api-for-preview ./deploy/secrets/create-secrets.sh --all
ENV=dev ./deploy/secrets/create-secrets.sh database-url
```

Managed secrets: `database-url`, `go-api-jwt-secret`. The script prompts for
values interactively and grants the Cloud Run runtime service account
access to each secret.

SERVICE_NAME defaults to `content-api` and also accepts
`content-api-for-preview`. Both variants use the same secret specification,
but values are created and updated independently for each Cloud Run service.

Before deploying preview with these references, create its separate secrets
for the target environment (`dev`, `staging`, or `prod`) using the command
above with the appropriate `ENV`. Supply valid values for each credential;
separating Secret Manager resources does not require changing credentials
that must match another system. Existing public-service secrets remain in use
and must not be deleted. Creating a new secret version does not refresh
already-running revisions; redeploy the selected service after updates.

## Rollout

Deploy and verify dev, then staging, then production. Confirm the health
check and a real content read (e.g. a published post by slug). When
deploying a `content-api-for-preview` variant, additionally confirm it correctly
returns draft/unpublished content and that it is not reachable from the
public internet (only from the internal preview frontend). Confirm the
deployed service's public variables, secret references, runtime service
account, ingress, VPC subnet, timeout, and service-level scaling. Roll back
with `gcloud run services update-traffic <service> --to-revisions=<previous-revision>=100`.
