#!/usr/bin/env bash
set -euo pipefail

yarn run db-migrate
exec yarn start
