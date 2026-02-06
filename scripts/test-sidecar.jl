#!/usr/bin/env julia
#
# Smoke tests for the Friedman CLI sidecar.
#
# Calls Friedman.main() directly (no process spawn) to validate that
# every command produces valid JSON output without exceptions.
#
# Usage:
#   julia --project=src-tauri/sidecar scripts/test-sidecar.jl          # fast tests only
#   julia --project=src-tauri/sidecar scripts/test-sidecar.jl --slow   # include Bayesian tests
#
# Requirements:
#   - Julia deps installed: ./scripts/setup-sidecar.sh

using Friedman

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

const TEST_CSV = joinpath(@__DIR__, "..", "src-tauri", "tests", "fixtures", "test_macro_large.csv")

struct TestResult
    name::String
    passed::Bool
    error_msg::String
    json_found::Bool
    elapsed::Float64
end

"""
    extract_json(raw::String) -> Union{String, Nothing}

Extract the first JSON object or array from mixed stdout output.
Mirrors the Rust `extract_json()` logic in sidecar.rs.
"""
function extract_json(raw::String)
    # Fast path: entire output is valid JSON
    try
        JSON3 = Base.require(Base.PkgId(Base.UUID("0f8b85d8-7281-11e9-16c2-39a750bddbf1"), "JSON3"))
        JSON3.read(raw)
        return raw
    catch
    end

    # Find the first '{' or '['
    start = findfirst(c -> c == '{' || c == '[', raw)
    isnothing(start) && return nothing

    open_char = raw[start]
    close_char = open_char == '{' ? '}' : ']'

    depth = 0
    in_string = false
    escape = false
    end_pos = nothing

    for i in start:lastindex(raw)
        c = raw[i]
        if escape
            escape = false
            continue
        end
        if c == '\\' && in_string
            escape = true
            continue
        end
        if c == '"'
            in_string = !in_string
            continue
        end
        if in_string
            continue
        end
        if c == open_char
            depth += 1
        elseif c == close_char
            depth -= 1
            if depth == 0
                end_pos = i
                break
            end
        end
    end

    isnothing(end_pos) && return nothing
    return raw[start:end_pos]
end

"""
    run_test(name::String, args::Vector{String}) -> TestResult

Run a single Friedman command by calling main() directly,
capturing stdout, and checking for valid JSON output.
"""
function run_test(name::String, args::Vector{String})
    t0 = time()
    captured = ""
    passed = false
    error_msg = ""
    json_found = false

    try
        # Capture stdout via a temp file (redirect_stdout doesn't accept IOBuffer in Julia 1.12+)
        captured = mktemp() do path, io
            redirect_stdout(io) do
                Friedman.main(args)
            end
            flush(io)
            read(path, String)
        end

        # Check for valid JSON in output
        json_str = extract_json(captured)
        if json_str !== nothing
            json_found = true
            passed = true
        else
            error_msg = "No JSON found in output ($(length(captured)) bytes captured)"
            if length(captured) > 0
                error_msg *= "\nFirst 300 chars: $(first(captured, 300))"
            end
        end
    catch e
        error_msg = sprint(showerror, e)
        # Truncate long error messages
        if length(error_msg) > 500
            error_msg = first(error_msg, 500) * "..."
        end
    end

    elapsed = time() - t0
    return TestResult(name, passed, error_msg, json_found, elapsed)
end

# ---------------------------------------------------------------------------
# Test definitions
# ---------------------------------------------------------------------------

function fast_tests()
    c = TEST_CSV
    tests = Pair{String,Vector{String}}[]

    # --- VAR ---
    push!(tests, "var estimate (defaults)" =>
        ["var", "estimate", c, "--trend", "constant", "--format", "json"])
    push!(tests, "var estimate (lags=2)" =>
        ["var", "estimate", c, "--lags", "2", "--trend", "none", "--format", "json"])
    push!(tests, "var lagselect (aic)" =>
        ["var", "lagselect", c, "--max-lags", "8", "--criterion", "aic", "--format", "json"])
    push!(tests, "var lagselect (bic)" =>
        ["var", "lagselect", c, "--max-lags", "8", "--criterion", "bic", "--format", "json"])
    push!(tests, "var stability" =>
        ["var", "stability", c, "--lags", "2", "--format", "json"])

    # --- IRF ---
    push!(tests, "irf compute (cholesky, no ci)" =>
        ["irf", "compute", c, "--shock", "1", "--horizons", "10", "--id", "cholesky",
         "--ci", "none", "--replications", "100", "--format", "json"])
    push!(tests, "irf compute (cholesky, bootstrap)" =>
        ["irf", "compute", c, "--shock", "1", "--horizons", "10", "--id", "cholesky",
         "--ci", "bootstrap", "--replications", "100", "--lags", "2", "--format", "json"])

    # --- FEVD ---
    push!(tests, "fevd compute (cholesky)" =>
        ["fevd", "compute", c, "--horizons", "10", "--id", "cholesky", "--format", "json"])
    push!(tests, "fevd compute (cholesky, lags=2)" =>
        ["fevd", "compute", c, "--horizons", "10", "--id", "cholesky", "--lags", "2", "--format", "json"])

    # --- HD ---
    push!(tests, "hd compute (cholesky)" =>
        ["hd", "compute", c, "--id", "cholesky", "--format", "json"])
    push!(tests, "hd compute (cholesky, lags=2)" =>
        ["hd", "compute", c, "--id", "cholesky", "--lags", "2", "--format", "json"])

    # --- LP ---
    push!(tests, "lp estimate (newey_west)" =>
        ["lp", "estimate", c, "--shock", "1", "--horizons", "10",
         "--control-lags", "4", "--vcov", "newey_west", "--format", "json"])
    push!(tests, "lp estimate (white)" =>
        ["lp", "estimate", c, "--shock", "1", "--horizons", "8",
         "--control-lags", "2", "--vcov", "white", "--format", "json"])
    push!(tests, "lp smooth" =>
        ["lp", "smooth", c, "--shock", "1", "--horizons", "10",
         "--knots", "3", "--lambda", "0", "--format", "json"])
    push!(tests, "lp state (logistic)" =>
        ["lp", "state", c, "--shock", "1", "--state-var", "1", "--horizons", "10",
         "--gamma", "1.5", "--method", "logistic", "--format", "json"])
    push!(tests, "lp propensity (logit)" =>
        ["lp", "propensity", c, "--treatment", "1", "--horizons", "10",
         "--score-method", "logit", "--format", "json"])
    push!(tests, "lp multi (shocks=1,2)" =>
        ["lp", "multi", c, "--horizons", "10", "--control-lags", "4",
         "--vcov", "newey_west", "--shocks", "1,2", "--format", "json"])
    push!(tests, "lp robust" =>
        ["lp", "robust", c, "--treatment", "1", "--horizons", "10",
         "--score-method", "logit", "--format", "json"])

    # --- Factor ---
    push!(tests, "factor static (auto)" =>
        ["factor", "static", c, "--criterion", "ic1", "--format", "json"])
    push!(tests, "factor static (nfactors=2)" =>
        ["factor", "static", c, "--nfactors", "2", "--criterion", "ic1", "--format", "json"])
    push!(tests, "factor dynamic (twostep)" =>
        ["factor", "dynamic", c, "--factor-lags", "1", "--method", "twostep", "--format", "json"])
    push!(tests, "factor gdfm (auto)" =>
        ["factor", "gdfm", c, "--format", "json"])

    # --- Unit Root Tests ---
    push!(tests, "test adf (constant)" =>
        ["test", "adf", c, "--column", "2", "--trend", "constant", "--format", "json"])
    push!(tests, "test kpss (constant)" =>
        ["test", "kpss", c, "--column", "2", "--trend", "constant", "--format", "json"])
    push!(tests, "test pp (constant)" =>
        ["test", "pp", c, "--column", "2", "--trend", "constant", "--format", "json"])
    push!(tests, "test za (both)" =>
        ["test", "za", c, "--column", "2", "--trend", "both", "--trim", "0.15", "--format", "json"])
    push!(tests, "test np (constant)" =>
        ["test", "np", c, "--column", "2", "--trend", "constant", "--format", "json"])
    push!(tests, "test johansen" =>
        ["test", "johansen", c, "--lags", "2", "--trend", "constant", "--format", "json"])

    # --- ARIMA ---
    push!(tests, "arima estimate (1,0,0)" =>
        ["arima", "estimate", c, "--column", "2", "--p", "1", "--d", "0", "--q", "0",
         "--method", "css_mle", "--format", "json"])
    push!(tests, "arima auto (bic)" =>
        ["arima", "auto", c, "--column", "2", "--max-p", "3", "--max-d", "1", "--max-q", "3",
         "--criterion", "bic", "--method", "css_mle", "--format", "json"])
    push!(tests, "arima forecast (1,0,0)" =>
        ["arima", "forecast", c, "--column", "2", "--p", "1", "--d", "0", "--q", "0",
         "--horizons", "12", "--confidence", "0.95", "--method", "css_mle", "--format", "json"])

    # --- Factor Forecast (v0.1.2) ---
    push!(tests, "factor forecast (auto)" =>
        ["factor", "forecast", c, "--horizon", "6", "--ci-method", "none", "--format", "json"])
    push!(tests, "factor forecast (nfactors=2)" =>
        ["factor", "forecast", c, "--nfactors", "2", "--horizon", "6", "--format", "json"])

    # --- Non-Gaussian SVAR (v0.1.2) ---
    push!(tests, "nongaussian fastica (logcosh)" =>
        ["nongaussian", "fastica", c, "--lags", "2", "--method", "fastica",
         "--contrast", "logcosh", "--format", "json"])
    push!(tests, "nongaussian ml (student_t)" =>
        ["nongaussian", "ml", c, "--lags", "2", "--distribution", "student_t", "--format", "json"])
    push!(tests, "nongaussian normality" =>
        ["nongaussian", "normality", c, "--lags", "2", "--format", "json"])
    push!(tests, "nongaussian identifiability (all)" =>
        ["nongaussian", "identifiability", c, "--lags", "2", "--test", "all",
         "--method", "fastica", "--format", "json"])

    return tests
end

function slow_tests()
    c = TEST_CSV
    tests = Pair{String,Vector{String}}[]

    # --- BVAR (Bayesian — slow) ---
    push!(tests, "bvar estimate (minnesota)" =>
        ["bvar", "estimate", c, "--lags", "2", "--prior", "minnesota",
         "--draws", "500", "--sampler", "nuts", "--format", "json"])
    push!(tests, "bvar posterior (mean)" =>
        ["bvar", "posterior", c, "--lags", "2", "--draws", "500",
         "--sampler", "nuts", "--method", "mean", "--format", "json"])

    # --- Bayesian IRF ---
    push!(tests, "irf compute (bayesian)" =>
        ["irf", "compute", c, "--shock", "1", "--horizons", "10", "--id", "cholesky",
         "--ci", "bootstrap", "--replications", "100", "--bayesian",
         "--draws", "500", "--sampler", "nuts", "--format", "json"])

    # --- Bayesian FEVD ---
    push!(tests, "fevd compute (bayesian)" =>
        ["fevd", "compute", c, "--horizons", "10", "--id", "cholesky",
         "--bayesian", "--draws", "500", "--sampler", "nuts", "--format", "json"])

    # --- Bayesian HD ---
    push!(tests, "hd compute (bayesian)" =>
        ["hd", "compute", c, "--horizons", "10", "--id", "cholesky",
         "--bayesian", "--draws", "500", "--sampler", "nuts", "--format", "json"])

    return tests
end

# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------

function main()
    run_slow = "--slow" in ARGS

    println("=" ^ 70)
    println("Friedman Sidecar Smoke Tests")
    println("=" ^ 70)
    println("Test CSV: $TEST_CSV")
    println("Mode: $(run_slow ? "fast + slow (Bayesian)" : "fast only")")
    println()

    if !isfile(TEST_CSV)
        println("ERROR: Test fixture not found: $TEST_CSV")
        println("Run: julia scripts/generate-test-data.jl")
        exit(1)
    end

    tests = fast_tests()
    if run_slow
        append!(tests, slow_tests())
    end

    results = TestResult[]
    n_pass = 0
    n_fail = 0

    for (i, (name, args)) in enumerate(tests)
        print("  [$(lpad(i, 2))/$(length(tests))] $name ... ")
        flush(stdout)

        result = run_test(name, args)
        push!(results, result)

        if result.passed
            n_pass += 1
            println("PASS ($(round(result.elapsed; digits=1))s)")
        else
            n_fail += 1
            println("FAIL ($(round(result.elapsed; digits=1))s)")
            # Print error details indented
            for line in split(result.error_msg, '\n')
                println("       $line")
            end
        end
    end

    # --- Summary ---
    println()
    println("=" ^ 70)
    println("Results: $n_pass passed, $n_fail failed, $(length(tests)) total")
    println("=" ^ 70)

    if n_fail > 0
        println()
        println("FAILED TESTS:")
        for r in results
            if !r.passed
                println("  - $(r.name): $(first(r.error_msg, 200))")
            end
        end
        println()
        exit(1)
    else
        println()
        total_time = sum(r.elapsed for r in results)
        println("All tests passed in $(round(total_time; digits=1))s")
    end
end

# Note: GMM excluded — requires config TOML fixture (follow-up task)
# Note: LP IV excluded — requires instruments file

main()
