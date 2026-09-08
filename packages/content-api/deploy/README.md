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
  `_SERVICE_NAME=content-api-for-preview`. Only a `prod` variant exists.

## Public Configuration

Public environment variables are stored per service:

```text
deploy/env.dev.content-api.public.yaml
deploy/env.staging.content-api.public.yaml
deploy/env.prod.content-api.public.yaml
deploy/env.prod.content-api-for-preview.public.yaml
```

The preview variant differs only in `IS_PREVIEW_SERVER: "true"` and a more
restrictive `CORS_ALLOW_ORIGINS`/ingress (`--ingress internal`, set at
deploy time in the root `cloudbuild.yaml`). Never set
`IS_PREVIEW_SERVER=true` on the public content-api service.

`PORT` is provided by Cloud Run and is intentionally not managed here.
Passwords, connection strings, and JWT secrets must not be added to these
files — see `## Secrets` below.

## Secrets

Secret IDs follow this pattern, **shared by both content-api and
content-api-for-preview**:

```text
${ENV}-content-api_${secret-key}
```

Create or update secrets from `packages/content-api`:

```bash
ENV=dev ./deploy/secrets/create-secrets.sh --all
ENV=dev ./deploy/secrets/create-secrets.sh database-url
```

Managed secrets: `database-url`, `go-api-jwt-secret`. The script prompts for
values interactively and grants the Cloud Run runtime service account
access to each secret.

## Rollout

Deploy and verify dev, then staging, then production. Confirm the health
check and a real content read (e.g. a published post by slug). When
deploying `prod-content-api-for-preview`, additionally confirm it correctly
returns draft/unpublished content and that it is not reachable from the
public internet (only from the internal preview frontend). Confirm the
deployed service's public variables, secret references, runtime service
account, ingress, VPC subnet, timeout, and service-level scaling. Roll back
with `gcloud run services update-traffic <service> --to-revisions=<previous-revision>=100`.
