#!/usr/bin/env bash
#
# build-sidecar.sh — macOS/Linux wrapper for building the Friedman CLI sidecar
#
# Usage:
#   ./scripts/build-sidecar.sh [/path/to/Friedman-cli]
#
# Prerequisites:
#   - Julia 1.10+ installed and on PATH
#   - PackageCompiler.jl (will be auto-installed)
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

CLI_PROJECT="${1:-${PROJECT_ROOT}/../Friedman-cli}"

if [ ! -d "$CLI_PROJECT" ]; then
    echo "Error: Friedman CLI project not found at: $CLI_PROJECT"
    echo "Usage: $0 [/path/to/Friedman-cli]"
    exit 1
fi

# Check Julia is available
if ! command -v julia &> /dev/null; then
    echo "Error: Julia not found on PATH. Install Julia 1.10+ first."
    exit 1
fi

echo "=== Building Friedman CLI sidecar ==="
echo "CLI project: $CLI_PROJECT"
echo "Output: $PROJECT_ROOT/src-tauri/binaries/"
echo ""

julia "$SCRIPT_DIR/build-julia-sidecar.jl" "$CLI_PROJECT"

echo ""
echo "=== Build complete ==="
echo "Binary location: $PROJECT_ROOT/src-tauri/binaries/friedman-cli"

# Verify the binary
if [ -f "$PROJECT_ROOT/src-tauri/binaries/friedman-cli" ]; then
    echo "Binary size: $(du -h "$PROJECT_ROOT/src-tauri/binaries/friedman-cli" | cut -f1)"
    echo ""
    echo "Test with:"
    echo "  $PROJECT_ROOT/src-tauri/binaries/friedman-cli --help"
else
    echo "Warning: Binary not found at expected path."
    echo "Check $PROJECT_ROOT/src-tauri/binaries/ for the app directory."
fi
