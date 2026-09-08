# Cronjob Deployment

`packages/cronjob/cloudbuild.yaml` builds one image and deploys it as two
Cloud Run **Jobs** (not services): `rss` and `scheduled-post`. This
directory owns the environment-specific public configuration and Secret
Manager specification for both.

The Cloud Build trigger must set `_ENV` to `dev`, `staging`, or `prod`. Job
names are derived as `${_ENV}-cronjob-rss` and
`${_ENV}-cronjob-scheduled-post`.

## Public Configuration

Public environment variables are stored per job:

```text
deploy/env.dev.rss.public.yaml              deploy/env.dev.scheduled-post.public.yaml
deploy/env.staging.rss.public.yaml          deploy/env.staging.scheduled-post.public.yaml
deploy/env.prod.rss.public.yaml             deploy/env.prod.scheduled-post.public.yaml
```

`scheduled-post` only needs `API_URL` — it calls the CMS GraphQL API via
`configs.apiUrl`/`configs.cronjobAccount`. `KEY_FILENAME` is intentionally
not set anywhere — the Cloud Run job's own runtime service account identity
is used instead. Passwords must never be added to these files — see
`## Secrets` below.

## Secrets

Each job has its own secret specification (`rss.secrets` or
`scheduled-post.secrets`) and secret IDs prefixed with its Cloud Run job
name. Both jobs require `CRONJOB_ACCOUNT_EMAIL` and
`CRONJOB_ACCOUNT_PASSWORD`; RSS additionally requires `SLACK_LOG_HOOK`:

```text
${ENV}-cronjob-rss_cronjob-account-email             -> CRONJOB_ACCOUNT_EMAIL
${ENV}-cronjob-rss_cronjob-account-password          -> CRONJOB_ACCOUNT_PASSWORD
${ENV}-cronjob-rss_slack-log-hook                    -> SLACK_LOG_HOOK
${ENV}-cronjob-scheduled-post_cronjob-account-email  -> CRONJOB_ACCOUNT_EMAIL
${ENV}-cronjob-scheduled-post_cronjob-account-password -> CRONJOB_ACCOUNT_PASSWORD
```

Create or update secrets from `packages/cronjob`:

```bash
ENV=dev JOB_NAME=rss ./deploy/secrets/create-secrets.sh --all
ENV=dev JOB_NAME=scheduled-post ./deploy/secrets/create-secrets.sh --all
```

The script prompts for values interactively and grants the Cloud Run
runtime service account access to each secret.

The jobs may use the same CMS login values, but each job provisions and
references its own secrets. If the old `${ENV}-cronjob-account_*` secrets
are already in use, create the job-specific secrets and update each job's
environment variable bindings before retiring the old secrets. These
scripts do not update job bindings; the current Cloud Build configuration
does not yet wire these Secret Manager references into the jobs.

## Rollout

Deploy and verify dev, then staging, then production. After each `rss`
deploy, manually trigger the job once (`gcloud run jobs execute
<job-name>`) and confirm the RSS file lands in the target bucket. After each
`scheduled-post` deploy, confirm it can authenticate against the CMS
GraphQL API. Confirm the deployed job's public variables, secret
references, runtime service account, VPC subnet, task timeout, and
max-retries. There is no traffic-based rollback for jobs — to roll back,
redeploy the previous image tag.
