#!/usr/bin/env bash
if [ -z "${BASH_VERSION:-}" ]; then
  exec bash "$0" "$@"
fi

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ENV=dev|staging|prod SECRET_PREFIX=... SECRET_SPEC=... LABELS=... \
    scripts/create-cloud-run-secrets.sh SECRET_SUFFIX
  ENV=dev|staging|prod SECRET_PREFIX=... SECRET_SPEC=... LABELS=... \
    scripts/create-cloud-run-secrets.sh --all

Required:
  ENV            Target environment: dev, staging, or prod.
  SECRET_PREFIX  Exact Secret Manager ID prefix.
  SECRET_SPEC    Secret specification file.
  LABELS         Labels applied to each managed secret.

Optional:
  PROJECT_ID                    Defaults to kids-reporter.
  RUNTIME_SECRET_ACCESS_MEMBER  Defaults to the project's Cloud Run runtime
                                 service account. Set this explicitly until
                                 that account is confirmed.

Spec format:
  secret-key
  secret-key text
  secret-key file ENV_VAR_WITH_FILE_PATH

Text values are prompted interactively. File values are loaded from the path
in the named environment variable. Secret IDs follow ${SECRET_PREFIX}_${secret-key}.
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ $# -ne 1 ]]; then
  echo "Specify one secret suffix or --all." >&2
  usage >&2
  exit 1
fi

SECRET_SELECTOR="$1"
PROJECT_ID="${PROJECT_ID:-kids-reporter}"
ENV="${ENV:-}"
SECRET_PREFIX="${SECRET_PREFIX:-}"
SECRET_SPEC="${SECRET_SPEC:-}"
LABELS="${LABELS:-}"
RUNTIME_SECRET_ACCESS_MEMBER="${RUNTIME_SECRET_ACCESS_MEMBER:-serviceAccount:sa-kids-cloud-run-runtime@kids-reporter.iam.gserviceaccount.com}"

if [[ ! "$ENV" =~ ^(dev|staging|prod)$ ]]; then
  echo "ENV must be dev, staging, or prod." >&2
  exit 1
fi

if [[ -z "$SECRET_PREFIX" || -z "$SECRET_SPEC" || -z "$LABELS" ]]; then
  echo "SECRET_PREFIX, SECRET_SPEC, and LABELS are required." >&2
  usage >&2
  exit 1
fi

if [[ ! -f "$SECRET_SPEC" ]]; then
  echo "Secret spec not found: $SECRET_SPEC" >&2
  exit 1
fi

if ! command -v gcloud >/dev/null 2>&1; then
  echo "gcloud command is required." >&2
  exit 1
fi

ensure_runtime_access() {
  local secret_id="$1"

  gcloud secrets add-iam-policy-binding "$secret_id" \
    --project="$PROJECT_ID" \
    --member="$RUNTIME_SECRET_ACCESS_MEMBER" \
    --role=roles/secretmanager.secretAccessor \
    --condition=None \
    --quiet >/dev/null
}

ensure_secret_labels() {
  local secret_id="$1"

  gcloud secrets update "$secret_id" \
    --project="$PROJECT_ID" \
    --update-labels="$LABELS" \
    >/dev/null
}

put_text_secret() {
  local secret_id="$1"
  local value

  read -rsp "Value for ${secret_id}: " value </dev/tty
  printf '\n' >/dev/tty

  if [[ -z "$value" ]]; then
    echo "Value for ${secret_id} cannot be empty." >&2
    exit 1
  fi

  if gcloud secrets describe "$secret_id" --project="$PROJECT_ID" >/dev/null 2>&1; then
    ensure_secret_labels "$secret_id"
    printf '%s' "$value" | gcloud secrets versions add "$secret_id" \
      --project="$PROJECT_ID" \
      --data-file=-
  else
    printf '%s' "$value" | gcloud secrets create "$secret_id" \
      --project="$PROJECT_ID" \
      --labels="$LABELS" \
      --replication-policy=automatic \
      --data-file=-
  fi

  ensure_runtime_access "$secret_id"
  unset value
}

put_file_secret() {
  local secret_id="$1"
  local path="$2"

  if [[ ! -f "$path" ]]; then
    echo "Missing file for ${secret_id}: ${path}" >&2
    exit 1
  fi

  if gcloud secrets describe "$secret_id" --project="$PROJECT_ID" >/dev/null 2>&1; then
    ensure_secret_labels "$secret_id"
    gcloud secrets versions add "$secret_id" \
      --project="$PROJECT_ID" \
      --data-file="$path"
  else
    gcloud secrets create "$secret_id" \
      --project="$PROJECT_ID" \
      --labels="$LABELS" \
      --replication-policy=automatic \
      --data-file="$path"
  fi

  ensure_runtime_access "$secret_id"
}

SECRET_KEYS=()
SECRET_KINDS=()
SECRET_FILE_ENVS=()
while read -r key kind file_env extra || [[ -n "${key:-}" ]]; do
  if [[ -z "${key:-}" || "$key" == \#* ]]; then
    continue
  fi

  if [[ -n "${extra:-}" ]]; then
    echo "Invalid secret spec line for ${key}." >&2
    exit 1
  fi

  kind="${kind:-text}"
  if [[ "$kind" != "text" && "$kind" != "file" ]]; then
    echo "Invalid secret kind for ${key}: ${kind}" >&2
    exit 1
  fi
  if [[ "$kind" == "file" && -z "${file_env:-}" ]]; then
    echo "File secret ${key} must specify an environment variable." >&2
    exit 1
  fi

  SECRET_KEYS+=("$key")
  SECRET_KINDS+=("$kind")
  SECRET_FILE_ENVS+=("${file_env:-}")
done < "$SECRET_SPEC"

if [[ ${#SECRET_KEYS[@]} -eq 0 ]]; then
  echo "Secret spec contains no entries: $SECRET_SPEC" >&2
  exit 1
fi

SELECTED_INDEXES=()
if [[ "$SECRET_SELECTOR" == "--all" ]]; then
  for index in "${!SECRET_KEYS[@]}"; do
    SELECTED_INDEXES+=("$index")
  done
elif [[ "$SECRET_SELECTOR" == -* ]]; then
  echo "Unknown option: $SECRET_SELECTOR" >&2
  usage >&2
  exit 1
else
  for index in "${!SECRET_KEYS[@]}"; do
    if [[ "${SECRET_KEYS[$index]}" == "$SECRET_SELECTOR" ]]; then
      SELECTED_INDEXES+=("$index")
      break
    fi
  done

  if [[ ${#SELECTED_INDEXES[@]} -eq 0 ]]; then
    echo "Secret suffix not found in $SECRET_SPEC: $SECRET_SELECTOR" >&2
    exit 1
  fi
fi

updated_count=0
for index in "${SELECTED_INDEXES[@]}"; do
  key="${SECRET_KEYS[$index]}"
  secret_id="${SECRET_PREFIX}_${key}"

  if [[ "${SECRET_KINDS[$index]}" == "file" ]]; then
    file_env="${SECRET_FILE_ENVS[$index]}"
    file_path="${!file_env:-}"
    if [[ -z "$file_path" ]]; then
      echo "SKIP ${secret_id}: set ${file_env} to create it"
      continue
    fi
    put_file_secret "$secret_id" "$file_path"
  else
    put_text_secret "$secret_id"
  fi

  updated_count=$((updated_count + 1))
done

echo "Updated ${updated_count} secret value(s). Redeploy the target Cloud Run resource to use the latest versions."
