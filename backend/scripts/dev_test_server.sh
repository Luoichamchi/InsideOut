#!/usr/bin/env bash
# Starts the backend against a throwaway database (fresh temp file every
# run) AND on a separate port — so manual/agent testing (seeding data,
# screenshotting, etc.) can never touch the real finance.db, and never has
# to kill whatever real instance the user may already have running on 8000.
# Use this instead of `uv run python -m app.main` whenever the goal is
# testing, not real usage.
set -euo pipefail
cd "$(dirname "$0")/.."

export FINANCE_DB_PATH
FINANCE_DB_PATH="$(mktemp -t finance-test.XXXXXX.db)"
export PORT="${PORT:-8001}"
echo "Scratch DB (real finance.db is untouched): $FINANCE_DB_PATH"
echo "Listening on port $PORT (real instance on 8000, if any, is untouched)"

uv run python -m app.main
