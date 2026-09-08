#!/usr/bin/env bash
if [ -z "${BASH_VERSION:-}" ]; then
  exec bash "$0" "$@"
fi

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ENV=dev|staging|prod ./deploy/secrets/create-secrets.sh [SECRET_SUFFIX|--all]

Shared by both the content-api and content-api-for-preview Cloud Run
services (same database, same JWT secret, one set of secrets under the
${ENV}-content-api prefix). With no selector, all content-api secrets are
created or updated.
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
CLOUD_RUN_SERVICE="${ENV}-content-api"
SECRET_PREFIX="$CLOUD_RUN_SERVICE"
SECRET_SPEC="${SCRIPT_DIR}/content-api.secrets"
LABELS="env=${ENV},system=content-api,cloud-run-service=${CLOUD_RUN_SERVICE},resource-type=cloud-run-service,managed-by=deploy-script,data-class=credential"
export PROJECT_ID ENV SECRET_PREFIX SECRET_SPEC LABELS
exec "${ROOT_DIR}/scripts/create-cloud-run-secrets.sh" "${1:---all}"
