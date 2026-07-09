#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

run_migrate=false
for arg in "$@"; do
  case "$arg" in
    -db) run_migrate=true ;;
  esac
done

git pull

doas docker compose -f docker-compose.prod.yml up -d --build

if [[ "$run_migrate" == true ]]; then
  doas docker compose -f docker-compose.prod.yml exec server npm run db:migrate:prod
fi
