#!/usr/bin/env bash
#
# setup-sidecar.sh
#
# Installs the Friedman-cli Julia dependencies from GitHub.
# Run once after cloning the repo, or when deps change.
#
# Usage: ./scripts/setup-sidecar.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SIDECAR_DIR="$PROJECT_DIR/src-tauri/sidecar"

echo "==> Installing Friedman-cli Julia dependencies..."
echo "    Project: $SIDECAR_DIR"

julia --project="$SIDECAR_DIR" --startup-file=no -e '
    using Pkg
    Pkg.instantiate()
    Pkg.precompile()
    println("==> Friedman-cli sidecar ready.")
'
