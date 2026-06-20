$ErrorActionPreference = "Stop"

Write-Host "Installing npm dependencies..."
npm install

Write-Host "Type checking and building Electron EXE artifacts..."
npm run electron:build

$package = Get-Content "package.json" -Raw | ConvertFrom-Json
$version = $package.version
$artifacts = @(
  "release\LocalPDF-Studio-Setup-$version-x64.exe",
  "release\LocalPDF-Studio-Portable-$version-x64.zip",
  "release\win-unpacked\LocalPDF Studio.exe"
)

Write-Host "Artifacts:"
Get-Item $artifacts | Select-Object Name, Length, LastWriteTime
