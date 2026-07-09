#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

set -a
source .env
set +a

POSTGRES_USER="${POSTGRES_USER:-dogear}"
POSTGRES_DB="${POSTGRES_DB:-dogear}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-dogear}"

docker compose up -d db
until docker compose exec -T db pg_isready -U "$POSTGRES_USER" > /dev/null 2>&1; do
  sleep 1
done

mkdir -p backups
file="backups/dogear_$(date +%Y%m%d_%H%M%S).sql"

docker compose exec -T -e PGPASSWORD="$POSTGRES_PASSWORD" db \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" > "$file"

echo "Saved: $file"
