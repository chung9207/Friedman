# Friedman

A desktop application for econometric time series analysis, built with [Tauri v2](https://v2.tauri.app/), React 19, and a Julia computation backend.

## Features

- **VAR** — Vector Autoregression: estimation, lag selection, stability, IRF, FEVD, historical decomposition, forecasting
- **Bayesian VAR** — BVAR estimation with NUTS/HMC/SMC samplers, posterior analysis, IRF, FEVD, HD, forecasting
- **Local Projections** — Standard, IV, smooth, state-dependent, propensity score, robust; plus structural IRF, FEVD, HD, and direct forecasts
- **Factor Models** — Static (PCA), dynamic, and generalized dynamic factor models; estimation and forecasting
- **Non-Gaussian SVAR** — ICA (FastICA, Infomax, JADE, SOBI, dCov, HSIC), ML identification, heteroskedasticity-based identification, normality testing, identifiability testing
- **Unit Root Tests** — ADF, KPSS, Phillips-Perron, Zivot-Andrews, Ng-Perron, Johansen cointegration
- **ARIMA** — Manual and automatic order selection, forecasting with confidence intervals
- **GMM** — Generalized Method of Moments with configurable weighting matrices

## Architecture

```
React UI → Tauri invoke() → Rust commands → friedman-cli (Julia sidecar) → JSON → UI
```

The app uses a guided journal-based workflow: select an analysis type, fill in parameters, view results with interactive charts, and proceed to the next logical step.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/tools/install)
- [Julia](https://julialang.org/downloads/) (v1.10+) — for building the sidecar

## Setup

```bash
npm install
```

### Set up the Julia sidecar (needed for full functionality)

```bash
./scripts/setup-sidecar.sh
```

### Build the compiled sidecar binary (optional — for production)

```bash
./scripts/build-sidecar.sh
```

## Development

```bash
npm run tauri dev
```

This starts both the Vite dev server and the Tauri window. In dev mode, the Julia sidecar runs directly via `julia --project=src-tauri/sidecar`.

## Build

```bash
npm run tauri build
```

## Testing

```bash
npm run test:run    # single pass (250 tests)
npm run test        # watch mode
npx tsc --noEmit    # type check
cargo check         # Rust type check (from src-tauri/)
```

## Command Tree (v0.1.3)

```
var:          estimate | lagselect | stability | irf | fevd | hd | forecast
bvar:         estimate | posterior | irf | fevd | hd | forecast
lp:           estimate | irf | fevd | hd | forecast
factor:       estimate (static|dynamic|gdfm) | forecast
test:         adf | kpss | pp | za | np | johansen
gmm:          estimate
arima:        estimate | forecast
nongaussian:  fastica | ml | heteroskedasticity | normality | identifiability
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| State | Zustand (5 stores) |
| Charts | Plotly.js (react-plotly.js), Solarized theme |
| UI | Radix UI, Lucide icons |
| Desktop | Tauri v2 (Rust) |
| Compute | Julia ([MacroEconometricModels.jl](https://github.com/chung9207/MacroEconometricModels.jl) via [Friedman-cli](https://github.com/chung9207/Friedman-cli) sidecar) |

## License

[MIT](LICENSE)
