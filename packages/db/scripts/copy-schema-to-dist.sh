#!/bin/sh

set -eu

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
package_root="$(CDPATH= cd -- "$script_dir/.." && pwd)"
source_schema="$package_root/../cms/schema.prisma"
dest_dir="$package_root/dist"
dest_schema="$dest_dir/schema.prisma"

if [ ! -f "$source_schema" ]; then
  echo "[@kids-reporter/db] Missing CMS schema at $source_schema. Run from the monorepo with packages/cms present." >&2
  exit 1
fi

mkdir -p "$dest_dir"
cp "$source_schema" "$dest_schema"
