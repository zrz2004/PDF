# Architecture

LocalPDF Studio uses a UI-first Tauri architecture:

```text
React UI -> Tauri commands/events -> Rust job manager -> sidecar engines
```

The React layer owns the workspace experience: tool grid, file list, options, preview placeholders, job progress, logs, history, and settings.

The Rust layer owns local safety boundaries: path validation, sidecar process execution, job state, progress events, engine detection, and future conversion implementations.

Conversion engines are intentionally modular so GPL/AGPL components can remain optional rather than bundled by default.
