# CMS Deployment

The root `cloudbuild.yaml` builds and deploys both `cms` and `gql` — one
package, two Cloud Run services. This directory owns the environment-specific
public configuration and Secret Manager specification for both.

The Cloud Build trigger must set `_ENV` to `dev`, `staging`, or `prod`.
- The `cms` service name is derived as `${_ENV}-cms`
  (`_TARGET_PACKAGE=cms`, `_DOCKERFILE=Dockerfile`, no `_SERVICE_NAME`
  override needed).
- The `gql` service name is `${_ENV}-gql`, produced from the same
  `packages/cms` directory by setting `_TARGET_PACKAGE=cms`,
  `_DOCKERFILE=Dockerfile.gql-only`, `_SERVICE_NAME=gql`.

Both Dockerfiles hardcode `ENV PORT 3000` — the Cloud Run deploy must pass
`--port 3000` explicitly.

## Public Configuration

Public environment variables are stored per service:

```text
deploy/env.dev.cms.public.yaml       deploy/env.dev.gql.public.yaml
deploy/env.staging.cms.public.yaml   deploy/env.staging.gql.public.yaml
deploy/env.prod.cms.public.yaml      deploy/env.prod.gql.public.yaml
```

`cms` and `gql` share almost all values (same code, same environment tier);
`gql`'s files set `IS_UI_DISABLED: "true"` and omit `GCS_BUCKET` (gql-only
skips the gcsfuse mount — see `run.sh`).

`PORT` is provided via the `gcloud run deploy --port 3000` flag, not this
file, and is intentionally not listed here. Passwords, connection strings,
API keys, and session/2FA secrets must never be added to these files — see
`## Secrets` below.

## Secrets

Secret IDs follow this pattern, **shared by both `cms` and `gql`** since
they run identical code against the same database:

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

Changing `session-secret` invalidates existing CMS sessions for both `cms`
and `gql`.

## Rollout

**Hard ordering requirement:** `prod-cms` must finish deploying — including
its database migration, which only runs in the `cms` service via `run.sh` —
before `prod-gql` is deployed. `gql` assumes the schema `cms` just migrated
to. The same ordering applies to `dev`/`staging`.

Deploy and verify dev, then staging, then production, `cms` before `gql` in
each. Confirm the health check, CMS login and 2FA (on `cms`), a GraphQL
query round-trip (on `gql`), and the GCS file/image mount (on `cms`). Confirm
the deployed service's public variables, secret references, runtime service
account, ingress, VPC subnet, timeout, and service-level scaling. 

Note that rolling back `cms` alone does not revert a completed database
migration.
