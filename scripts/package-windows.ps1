$ErrorActionPreference = "Stop"

Write-Host "Checking Rust toolchain..."
try {
  cargo --version | Out-Host
} catch {
  throw "Rust/Cargo is required for Tauri packaging. Install Rust with: winget install --id Rustlang.Rustup -e"
}

Write-Host "Installing npm dependencies..."
npm install

Write-Host "Building frontend..."
npm run build

Write-Host "Building Windows installer..."
npm run tauri:build
