#!/usr/bin/env julia
#
# Generate deterministic test fixture for sidecar integration tests.
#
# Output: src-tauri/tests/fixtures/test_macro_large.csv
#   - 160 rows, 4 macro variables (gdp_growth, inflation, interest_rate, unemployment)
#   - Deterministic seed for reproducibility
#   - Mix of stationary (gdp_growth, inflation) and near-unit-root (interest_rate, unemployment)
#     so unit root tests give meaningful results
#
# Usage: julia scripts/generate-test-data.jl

using Random

Random.seed!(42)

T = 160
outpath = joinpath(@__DIR__, "..", "src-tauri", "tests", "fixtures", "test_macro_large.csv")

# --- Generate series ---

# gdp_growth: stationary AR(1) around mean 0.5
gdp = zeros(T)
gdp[1] = 0.5
for t in 2:T
    gdp[t] = 0.3 + 0.4 * gdp[t-1] + 0.3 * randn()
end

# inflation: stationary AR(2) around mean 2.0
infl = zeros(T)
infl[1] = 2.0
infl[2] = 2.1
for t in 3:T
    infl[t] = 0.6 + 0.5 * infl[t-1] - 0.15 * infl[t-2] + 0.2 * randn()
end

# interest_rate: near-unit-root (AR(1) with rho=0.97), starts at 5.0
rate = zeros(T)
rate[1] = 5.0
for t in 2:T
    rate[t] = 0.15 + 0.97 * rate[t-1] + 0.1 * randn()
end

# unemployment: random walk with drift (non-stationary)
unemp = zeros(T)
unemp[1] = 5.0
for t in 2:T
    unemp[t] = unemp[t-1] + 0.01 + 0.15 * randn()
end

# --- Write CSV ---
open(outpath, "w") do io
    println(io, "gdp_growth,inflation,interest_rate,unemployment")
    for t in 1:T
        println(io, "$(round(gdp[t]; digits=4)),$(round(infl[t]; digits=4)),$(round(rate[t]; digits=4)),$(round(unemp[t]; digits=4))")
    end
end

println("Wrote $(T) rows to $(outpath)")
