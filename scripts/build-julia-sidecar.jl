#!/usr/bin/env julia
#
# build-julia-sidecar.jl
#
# Compiles the Friedman CLI (Julia) into a standalone binary using
# PackageCompiler.jl. The resulting binary includes the Julia runtime
# and all dependencies — no Julia installation needed by end users.
#
# Usage:
#   julia scripts/build-julia-sidecar.jl [/path/to/Friedman-cli]
#
# Output:
#   src-tauri/binaries/friedman-cli   (macOS/Linux)
#   src-tauri/binaries/friedman-cli.exe (Windows)

using Pkg

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Path to the Friedman CLI Julia project
cli_project = if length(ARGS) >= 1
    ARGS[1]
else
    # Default: assume sibling directory
    joinpath(dirname(@__DIR__), "..", "Friedman-cli")
end

if !isdir(cli_project)
    error("Friedman CLI project not found at: $cli_project\n" *
          "Provide the path as the first argument.")
end

# Output directory
output_dir = joinpath(@__DIR__, "..", "src-tauri", "binaries")
mkpath(output_dir)

# ---------------------------------------------------------------------------
# Ensure PackageCompiler is available
# ---------------------------------------------------------------------------

try
    @eval using PackageCompiler
catch
    @info "Installing PackageCompiler.jl..."
    Pkg.add("PackageCompiler")
    @eval using PackageCompiler
end

# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------

@info "Building Friedman CLI standalone binary..." cli_project output_dir

# Activate the CLI project to resolve deps
Pkg.activate(cli_project)
Pkg.instantiate()

# Create the standalone app
# This bundles the Julia runtime + all deps into a self-contained directory.
# The entry point is `julia_main() -> Cint` defined in the CLI's main module.
app_dir = joinpath(output_dir, "friedman-cli-app")

create_app(
    cli_project,
    app_dir;
    executables = ["friedman-cli" => "julia_main"],
    precompile_execution_file = nothing,  # Add a precompile script if available
    force = true,
    include_lazy_artifacts = true,
)

# Copy the binary to the expected location
if Sys.iswindows()
    binary_name = "friedman-cli.exe"
else
    binary_name = "friedman-cli"
end

src_binary = joinpath(app_dir, "bin", binary_name)
dst_binary = joinpath(output_dir, binary_name)

if isfile(src_binary)
    cp(src_binary, dst_binary; force = true)
    @info "Standalone binary created at: $dst_binary"
else
    # For create_app, the binary lives inside the app directory
    @info "App directory created at: $app_dir"
    @info "Binary should be at: $src_binary"
    @warn "Binary not found at expected path. Check the app directory."
end

@info "Done! Binary size: $(round(filesize(dst_binary) / 1024 / 1024, digits=1)) MB"
