#
# build-sidecar.ps1 — Windows wrapper for building the Friedman CLI sidecar
#
# Usage:
#   .\scripts\build-sidecar.ps1 [-CliProject "C:\path\to\Friedman-cli"]
#
# Prerequisites:
#   - Julia 1.10+ installed and on PATH
#   - PackageCompiler.jl (will be auto-installed)
#

param(
    [string]$CliProject = ""
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

if ([string]::IsNullOrEmpty($CliProject)) {
    $CliProject = Join-Path (Split-Path -Parent $ProjectRoot) "Friedman-cli"
}

if (-not (Test-Path $CliProject)) {
    Write-Error "Friedman CLI project not found at: $CliProject"
    Write-Host "Usage: .\scripts\build-sidecar.ps1 [-CliProject 'C:\path\to\Friedman-cli']"
    exit 1
}

# Check Julia is available
try {
    $null = Get-Command julia -ErrorAction Stop
} catch {
    Write-Error "Julia not found on PATH. Install Julia 1.10+ first."
    exit 1
}

Write-Host "=== Building Friedman CLI sidecar ===" -ForegroundColor Cyan
Write-Host "CLI project: $CliProject"
Write-Host "Output: $ProjectRoot\src-tauri\binaries\"
Write-Host ""

$BuildScript = Join-Path $ScriptDir "build-julia-sidecar.jl"
& julia $BuildScript $CliProject

Write-Host ""
Write-Host "=== Build complete ===" -ForegroundColor Green

$BinaryPath = Join-Path $ProjectRoot "src-tauri\binaries\friedman-cli.exe"
if (Test-Path $BinaryPath) {
    $Size = (Get-Item $BinaryPath).Length / 1MB
    Write-Host ("Binary size: {0:N1} MB" -f $Size)
    Write-Host ""
    Write-Host "Test with:"
    Write-Host "  $BinaryPath --help"
} else {
    Write-Warning "Binary not found at expected path."
    Write-Host "Check $ProjectRoot\src-tauri\binaries\ for the app directory."
}
