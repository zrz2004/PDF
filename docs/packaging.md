# Packaging

## Electron build prerequisites

- Node.js 18+ and npm

## Electron EXE build

```powershell
npm install
npm run electron:build
```

Generated artifacts (version is read from `package.json` via the `${version}` token). For `1.0.0`:

- `release\\LocalPDF-Studio-Setup-1.0.0-x64.exe`
- `release\\LocalPDF-Studio-Portable-1.0.0-x64.zip`
- `release\\win-unpacked\\LocalPDF Studio.exe`

`electron-builder` uses the `${version}` token in `package.json`, so future versions should update automatically. The helper script `scripts\\package-electron.ps1` also reads the version from `package.json` instead of hardcoding artifact names.

The packaged Electron app uses `base: './'` in Vite so `dist/index.html` references `./assets/...` rather than `/assets/...`. This prevents the file-protocol black screen that happens when packaged Electron tries to load absolute asset paths.

A runtime smoke screenshot can be captured with (paths below are examples — use your own repo checkout):

```powershell
$repo = "<your-repo-path>"   # e.g. the local clone of this project
$env:LOCALPDF_SMOKE_CAPTURE = "$repo\tmp-smoke\electron-release-home.png"
& "$repo\release\win-unpacked\LocalPDF Studio.exe"
Remove-Item Env:\LOCALPDF_SMOKE_CAPTURE
```

A smoke conversion can be run with:

```powershell
$env:LOCALPDF_SMOKE_CONVERSION_REQUEST = "$repo\tmp-smoke\request.json"
$env:LOCALPDF_SMOKE_CONVERSION_RESULT = "$repo\tmp-smoke\result.json"
& "$repo\release\win-unpacked\LocalPDF Studio.exe"
Remove-Item Env:\LOCALPDF_SMOKE_CONVERSION_REQUEST
Remove-Item Env:\LOCALPDF_SMOKE_CONVERSION_RESULT
```

The conversion smoke path loads the same user settings and external-engine paths as normal app execution. The resolver also checks `LOCALPDF_TOOL_ROOT` and the portable default tool folders (`%LOCALAPPDATA%\LocalPDF\tools` on Windows, `~/.localpdf/tools` elsewhere); use `scripts\\install-external-tools.ps1` to attempt local winget installation before external-engine smoke tests. A representative matrix runner is available:

```powershell
.\\scripts\\smoke-matrix.ps1
```

## Tauri build prerequisites

- Rust/Cargo via rustup
- Visual Studio Build Tools for Windows if required by Rust/Tauri

## Tauri build

```powershell
npm install
npm run build
npm run tauri:build
```

If `npm run tauri:build` fails with `program not found: cargo`, install Rust first:

```powershell
winget install --id Rustlang.Rustup -e --accept-package-agreements --accept-source-agreements
```

Then restart the terminal so PATH includes Cargo and rerun the build. The Tauri converter stack is still scaffolded; Electron is the current working distribution path.
