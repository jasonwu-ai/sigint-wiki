#!/usr/bin/env bash
set -euo pipefail

# Data source - SigInt pipeline writes to /home/paperclip/signal-intelligence/
WIKI_DATA_ROOT="${WIKI_DATA_ROOT:-/home/paperclip/signal-intelligence}"
SITE_DIR="$(dirname "$0")/.."

cd "$SITE_DIR"

export WIKI_DATA_ROOT
export BUILT_AT="$(date -u '+%Y-%m-%d %H:%M UTC')"

echo "Building Signal Intelligence Wiki at $(date -u)"
echo "Data root: $WIKI_DATA_ROOT"

npm run build

echo "Build complete at $(date -u)"
