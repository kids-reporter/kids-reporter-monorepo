# Image Resizer Deployment

The root `cloudbuild.yaml` builds and deploys image-resizer. This directory
owns the environment-specific public configuration and Secret Manager
specification.

The Cloud Build trigger must set `_ENV` to `dev`, `staging`, or `prod`. The
Cloud Run service name is derived as `${_ENV}-image-resizer`.

Unlike the other services, this one is invoked by an Eventarc trigger
(GCS object-create audit log event on the environment's storage bucket), not
directly by users or a load balancer — ingress should be restricted
accordingly (not `internal-and-cloud-load-balancing`).

## Public Configuration

Public environment variables are stored per environment:

```text
deploy/env.dev.image-resizer.public.yaml
deploy/env.staging.image-resizer.public.yaml
deploy/env.prod.image-resizer.public.yaml
```

`TARGET_FOLDER`, `TARGET_SIZES`, and `PROJECT_ID` are identical across all
three files — none of them vary by environment in the app itself. What
actually differs per environment is which GCS bucket the Eventarc trigger
watches (`dev-kids-storage.twreporter.org` /
`staging-kids-storage.twreporter.org` / `kids-storage.twreporter.org`),
which is infra/trigger configuration outside this repo, not an app env var.
`PORT` is provided by Cloud Run and is intentionally not managed here.
`KEY_FILENAME` is intentionally not set — the Cloud Run service's own
runtime service account identity is used instead. Passwords must not be
added to this file — see `## Secrets` below.

## Secrets

Secret IDs follow this pattern:

```text
${ENV}-image-resizer_${secret-key}
```

Create or update secrets from `packages/image-resizer`:

```bash
ENV=dev ./deploy/secrets/create-secrets.sh --all
```

Managed secret: `slack-log-hook`. The script prompts for the value
interactively and grants the Cloud Run runtime service account access to
the secret.

## Rollout

Deploy and verify dev, then staging, then production. After deploying,
upload a test image to the `images/*` path of that environment's bucket and
confirm resized variants appear in the `resized` folder, and check
application logs for errors. Confirm the deployed service's public
variables, secret references, runtime service account, and the Eventarc
trigger's target service name still matches.
