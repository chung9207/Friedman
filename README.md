# Friedman

A desktop application for econometric time series analysis, built with [Tauri v2](https://v2.tauri.app/), React 19, and a Julia computation backend.

## Features

- **VAR / BVAR** — Vector Autoregression and Bayesian VAR estimation, lag selection, stability checks
- **IRF / FEVD / HD** — Impulse response functions, forecast error variance decomposition, historical decomposition
- **Local Projections** — Standard, IV, smooth, state-dependent, propensity score, multi-shock, doubly robust
- **Factor Models** — Static, dynamic, and generalized dynamic factor models
- **Unit Root Tests** — ADF, KPSS, Phillips-Perron, Zivot-Andrews, Ng-Perron, Johansen cointegration
- **ARIMA** — Manual and automatic model selection, forecasting
- **GMM** — Generalized Method of Moments estimation

## Architecture

```
React UI → Tauri invoke() → Rust commands → friedman-cli (Julia sidecar) → JSON → UI
```

The app uses a guided journal-based workflow: select an analysis type, fill in parameters, view results, and proceed to the next logical step.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/tools/install)
- [Julia](https://julialang.org/downloads/) (v1.10+) — for building the sidecar

## Setup

```bash
npm install
```

### Build the Julia sidecar (optional — needed for full functionality)

```bash
./scripts/build-sidecar.sh
```

## Development

```bash
npm run tauri dev
```

This starts both the Vite dev server and the Tauri window.

## Build

```bash
npm run tauri build
```

## Testing

```bash
npm run test:run    # single pass (176 tests)
npm run test        # watch mode
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| State | Zustand |
| Charts | Plotly.js (react-plotly.js) |
| Desktop | Tauri v2 (Rust) |
| Compute | Julia (Friedman.jl via PackageCompiler sidecar) |

## License

[MIT](LICENSE)
