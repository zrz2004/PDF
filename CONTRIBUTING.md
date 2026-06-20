# Contributing to LocalPDF Studio

Thanks for your interest in improving LocalPDF Studio! 🎉 This guide covers
getting set up and how to submit changes.

## Getting Started

**Prerequisites:**

- [Node.js](https://nodejs.org/) 18 or newer (comes with npm).
- Git.

**Optional engines** (only needed to work on engine-dependent features; see
[docs/external-engines.md](docs/external-engines.md) and the README):

- qpdf, LibreOffice, Tesseract OCR, Ghostscript.

## Setup

```bash
git clone https://github.com/zrz2004/PDF.git
cd PDF
npm install
```

## Development

```bash
npm run dev          # start the Vite renderer dev server (UI only)
npm run electron     # build + launch the full Electron app
npm run typecheck    # TypeScript type-check
```

The Electron app talks to a local Node conversion engine in `electron/`. External
engines are resolved via `electron/engines.cjs` (Settings page → configure each
engine path, or set `LOCALPDF_TOOL_ROOT`).

## Project Layout

```
src/            React + TypeScript renderer (UI, tool registry, workspace)
electron/       Electron main process + local conversion engine (CommonJS)
src-tauri/      Tauri/Rust scaffold (future native sidecar — not the active backend)
scripts/        Build, packaging, tool install, and smoke-test helpers
docs/           Architecture and engine documentation
```

> The **Electron** app is the current production path. The `src-tauri/` folder is
> a scaffold for future Rust-sidecar work and is not the active conversion
> backend.

## Building a Desktop Package Locally

```bash
npm run electron:build   # Windows installer (nsis) + portable zip in release/
```

Cross-platform binaries (Windows / macOS / Linux) are produced automatically by
the GitHub Actions workflow on every pushed `v*` tag.

## Coding Conventions

- Follow the existing code style; the repo includes an `.editorconfig`.
- Keep PRs focused — one feature or fix per pull request.
- Run `npm run typecheck` before submitting; ensure it passes.

## Submitting Changes

1. Fork the repo and create a branch from `main`.
2. Make your changes with clear commit messages.
3. If adding a user-facing feature, update the README and CHANGELOG.
4. Open a pull request and describe **what** changed and **why**.

## Reporting Bugs / Requesting Features

Use the [issue templates](.github/ISSUE_TEMPLATE/) and include the LocalPDF
Studio version and your OS. Screenshots or sample files (no sensitive data!)
help a lot.

## License

By contributing, you agree that your contributions will be licensed under the
[MIT License](LICENSE).
