#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

set -a
source .env
set +a

POSTGRES_USER="${POSTGRES_USER:-dogear}"
POSTGRES_DB="${POSTGRES_DB:-dogear}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-dogear}"

file="${1:-}"
if [[ -z "$file" ]]; then
  file=$(ls -t backups/*.sql 2>/dev/null | head -n1)
fi
if [[ -z "$file" || ! -f "$file" ]]; then
  echo "No backup file found. Usage: ./restore.sh [path/to/backup.sql]" >&2
  exit 1
fi

echo "This will REPLACE the '$POSTGRES_DB' database with the contents of: $file"
read -r -p "Continue? [y/N] " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Aborted."
  exit 1
fi

docker compose up -d db
until docker compose exec -T db pg_isready -U "$POSTGRES_USER" > /dev/null 2>&1; do
  sleep 1
done

docker compose exec -T -e PGPASSWORD="$POSTGRES_PASSWORD" db \
  psql -U "$POSTGRES_USER" -d postgres -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$POSTGRES_DB' AND pid <> pg_backend_pid();" \
  > /dev/null

docker compose exec -T -e PGPASSWORD="$POSTGRES_PASSWORD" db \
  psql -U "$POSTGRES_USER" -d postgres -c "DROP DATABASE IF EXISTS \"$POSTGRES_DB\";" > /dev/null

docker compose exec -T -e PGPASSWORD="$POSTGRES_PASSWORD" db \
  psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE \"$POSTGRES_DB\";" > /dev/null

docker compose exec -T -e PGPASSWORD="$POSTGRES_PASSWORD" db \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$file"

echo "Restored from: $file"
