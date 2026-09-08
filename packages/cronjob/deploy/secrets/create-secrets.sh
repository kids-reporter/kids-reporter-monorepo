#!/usr/bin/env bash
if [ -z "${BASH_VERSION:-}" ]; then
  exec bash "$0" "$@"
fi

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ENV=dev|staging|prod JOB_NAME=rss|scheduled-post ./deploy/secrets/create-secrets.sh [SECRET_SUFFIX|--all]

Each job owns its CMS account secrets. RSS also owns its Slack webhook:

  JOB_NAME=rss             -> secret prefix ${ENV}-cronjob-rss
  JOB_NAME=scheduled-post  -> secret prefix ${ENV}-cronjob-scheduled-post

With no selector, all secrets in the chosen JOB_NAME's spec are created or
updated.
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ $# -gt 1 ]]; then
  usage >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../../../.." && pwd)"

PROJECT_ID="${PROJECT_ID:-kids-reporter}"
ENV="${ENV:-}"
JOB_NAME="${JOB_NAME:-}"

if [[ "$JOB_NAME" != "rss" && "$JOB_NAME" != "scheduled-post" ]]; then
  echo "JOB_NAME must be 'rss' or 'scheduled-post'." >&2
  usage >&2
  exit 1
fi

CLOUD_RUN_JOB="${ENV}-cronjob-${JOB_NAME}"
SECRET_PREFIX="$CLOUD_RUN_JOB"
SECRET_SPEC="${SCRIPT_DIR}/${JOB_NAME}.secrets"
LABELS="env=${ENV},system=cronjob,job=${CLOUD_RUN_JOB},resource-type=cloud-run-job,managed-by=deploy-script,data-class=credential"
export PROJECT_ID ENV SECRET_PREFIX SECRET_SPEC LABELS
exec "${ROOT_DIR}/scripts/create-cloud-run-secrets.sh" "${1:---all}"
