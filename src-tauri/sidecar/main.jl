#!/usr/bin/env julia
#
# Entry point for the Friedman CLI sidecar.
# Invoked by the Tauri backend in dev mode.
#
# Usage: julia --project=src-tauri/sidecar --startup-file=no main.jl [args...]

using Friedman
Friedman.main(ARGS)
