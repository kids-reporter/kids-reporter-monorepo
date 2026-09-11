#!/usr/bin/env bash
if [ -z "${BASH_VERSION:-}" ]; then
  exec bash "$0" "$@"
fi

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ENV=dev|staging|prod SERVICE_NAME=content-api-for-preview ./deploy/secrets/create-secrets.sh [SECRET_SUFFIX|--all]
  ENV=dev|staging|prod ./deploy/secrets/create-secrets.sh [SECRET_SUFFIX|--all]

SERVICE_NAME defaults to content-api; also accepts content-api-for-preview.
Each Cloud Run service has its own secrets under ${ENV}-${SERVICE_NAME}.
With no selector, all secrets for the selected service are created or updated.
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
SERVICE_NAME="${SERVICE_NAME:-content-api}"
case "$SERVICE_NAME" in
  content-api|content-api-for-preview) ;;
  *)
    echo "SERVICE_NAME must be content-api or content-api-for-preview." >&2
    exit 1
    ;;
esac
CLOUD_RUN_SERVICE="${ENV}-${SERVICE_NAME}"
SECRET_PREFIX="$CLOUD_RUN_SERVICE"
SECRET_SPEC="${SCRIPT_DIR}/content-api.secrets"
LABELS="env=${ENV},system=content-api,cloud-run-service=${CLOUD_RUN_SERVICE},resource-type=cloud-run-service,managed-by=deploy-script,data-class=credential"
export PROJECT_ID ENV SECRET_PREFIX SECRET_SPEC LABELS
exec "${ROOT_DIR}/scripts/create-cloud-run-secrets.sh" "${1:---all}"
