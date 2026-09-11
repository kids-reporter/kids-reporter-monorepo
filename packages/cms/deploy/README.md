# CMS Deployment

The root `cloudbuild.yaml` builds and deploys the Keystone CMS service. This
directory owns its environment-specific public configuration and Secret
Manager specification.

The Cloud Build trigger must set `_ENV` to `dev`, `staging`, or `prod`.

- The service name is derived as `${_ENV}-cms`
  (`_TARGET_PACKAGE=cms`, no `_SERVICE_NAME` override needed).
- The legacy gql-only image and environment files are retained for now, but
  the root Cloud Build configuration does not build or deploy that service.

The Dockerfile hardcodes `ENV PORT 3000`, and Cloud Build declares the same
container port explicitly.

## Public Configuration

Public environment variables are stored per environment:

```text
deploy/env.dev.cms.public.yaml
deploy/env.staging.cms.public.yaml
deploy/env.prod.cms.public.yaml
```

`PORT` is provided via the `gcloud run deploy --port 3000` flag, not this
file, and is intentionally not listed here. Passwords, connection strings,
API keys, and session/2FA secrets must never be added to these files — see
`## Secrets` below.

The CMS storage bucket is attached by Cloud Run as a Cloud Storage volume at
`/app/public`. The container does not install or start gcsfuse itself.

## Secrets

Secret IDs follow this pattern:

```text
${ENV}-cms_${secret-key}
```

Create or update secrets from `packages/cms`:

```bash
ENV=dev ./deploy/secrets/create-secrets.sh --all
ENV=dev ./deploy/secrets/create-secrets.sh session-secret
```

The script prompts for values interactively and grants the Cloud Run
runtime service account access to each secret.

Changing `session-secret` invalidates existing CMS sessions.

## Rollout

Deploy and verify dev, then staging, then production. Confirm the health
check, CMS login and 2FA, a GraphQL query round-trip, and the Cloud Run GCS
volume for files/images. Confirm the deployed service's public variables,
secret references, runtime service account, ingress, VPC subnet, timeout,
probes, and service-level scaling.

Rolling back a CMS revision does not revert a completed database migration.
