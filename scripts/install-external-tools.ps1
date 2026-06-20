$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
if ($env:LOCALPDF_TOOL_ROOT) {
  $toolRoot = $env:LOCALPDF_TOOL_ROOT
} else {
  # Portable default: %LOCALAPPDATA%\LocalPDF\tools (created on demand)
  $toolRoot = Join-Path $env:LOCALAPPDATA "LocalPDF\tools"
}
$installerDir = Join-Path $toolRoot "installers"

if (-not (Test-Path $toolRoot)) {
  New-Item -ItemType Directory -Force $toolRoot | Out-Null
}
New-Item -ItemType Directory -Force $installerDir | Out-Null
Write-Host "Tool root: $toolRoot"
Write-Host "Tip: set LOCALPDF_TOOL_ROOT to override this location."

Push-Location $root
try {
  function Resolve-LocalPDFEngine($engineId) {
    $nodeCode = @'
const { resolveEngine } = require('./electron/engines.cjs');
const resolved = resolveEngine(process.argv[1]);
if (resolved) {
  console.log(resolved);
  process.exit(0);
}
process.exit(1);
'@
    $resolved = & node -e $nodeCode $engineId 2>$null
    if ($LASTEXITCODE -eq 0 -and $resolved) { return [string]$resolved }
    return $null
  }

  $winget = Get-Command winget -ErrorAction SilentlyContinue
  if (-not $winget) {
    throw "winget was not found. Install App Installer or manually place qpdf, LibreOffice, Tesseract, and Ghostscript under $toolRoot."
  }

  function Install-GhostscriptFromGitHub($targetDir) {
    $release = Invoke-RestMethod "https://api.github.com/repos/ArtifexSoftware/ghostpdl-downloads/releases/latest"
    $asset = $release.assets | Where-Object { $_.name -match '^gs.*w64\.exe$' } | Select-Object -First 1
    if (-not $asset) { throw "No Ghostscript win64 installer asset found in latest GitHub release." }
    $installer = Join-Path $installerDir $asset.name
    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $installer
    New-Item -ItemType Directory -Force $targetDir | Out-Null
    $process = Start-Process -FilePath $installer -ArgumentList @('/VERYSILENT','/SUPPRESSMSGBOXES','/NORESTART',"/DIR=$targetDir") -Wait -PassThru
    return $process.ExitCode
  }

  $packages = @(
    @{ Engine = "qpdf"; Name = "qpdf"; Id = "QPDF.QPDF"; Location = Join-Path $toolRoot "qpdf"; License = "Apache-2.0"; Url = "https://github.com/qpdf/qpdf" },
    @{ Engine = "libreoffice"; Name = "LibreOffice"; Id = "TheDocumentFoundation.LibreOffice"; Location = Join-Path $toolRoot "libreoffice"; License = "MPL-2.0"; Url = "https://www.libreoffice.org/" },
    @{ Engine = "tesseract"; Name = "Tesseract OCR"; Id = "UB-Mannheim.TesseractOCR"; Location = Join-Path $toolRoot "tesseract"; License = "Apache-2.0"; Url = "https://github.com/tesseract-ocr/tesseract" },
    @{ Engine = "external-ghostscript"; Name = "Ghostscript"; Id = "ArtifexSoftware.Ghostscript"; Location = Join-Path $toolRoot "ghostscript"; License = "AGPL-3.0-or-commercial; user-installed external engine only"; Url = "https://www.ghostscript.com/" }
  )

  $records = @()
  foreach ($pkg in $packages) {
    $existing = Resolve-LocalPDFEngine $pkg.Engine
    if ($existing) {
      Write-Host "[ok] $($pkg.Name) already available: $existing"
      $records += [pscustomobject]@{ Name = $pkg.Name; Engine = $pkg.Engine; Status = "available"; Path = $existing; License = $pkg.License; Url = $pkg.Url }
      continue
    }

    Write-Host "[install] $($pkg.Name) -> $($pkg.Location)"
    New-Item -ItemType Directory -Force $pkg.Location | Out-Null
    $args = @(
      "install",
      "--id", $pkg.Id,
      "--exact",
      "--silent",
      "--accept-source-agreements",
      "--accept-package-agreements",
      "--location", $pkg.Location
    )
    $process = Start-Process -FilePath $winget.Source -ArgumentList $args -Wait -PassThru -NoNewWindow
    $resolved = Resolve-LocalPDFEngine $pkg.Engine
    if (($process.ExitCode -ne 0 -or -not $resolved) -and $pkg.Engine -eq "external-ghostscript") {
      Write-Host "[fallback] Ghostscript is not available from this winget source; downloading official Artifex GitHub installer."
      try {
        $ghostExit = Install-GhostscriptFromGitHub $pkg.Location
        Write-Host "[fallback] Ghostscript installer exit=$ghostExit"
        $resolved = Resolve-LocalPDFEngine $pkg.Engine
      } catch {
        Write-Host "[warn] Ghostscript fallback failed: $_"
      }
    }
    if (-not $resolved) {
      Write-Host "[warn] $($pkg.Name) winget exit=$($process.ExitCode); resolver path=$resolved"
      if ($resolved) { $resolvedPath = $resolved } else { $resolvedPath = "" }
      $records += [pscustomobject]@{ Name = $pkg.Name; Engine = $pkg.Engine; Status = "install-attempted"; Path = $resolvedPath; License = $pkg.License; Url = $pkg.Url }
      continue
    }
    Write-Host "[ok] $($pkg.Name): $resolved"
    $records += [pscustomobject]@{ Name = $pkg.Name; Engine = $pkg.Engine; Status = "installed"; Path = $resolved; License = $pkg.License; Url = $pkg.Url }
  }

  $records | ConvertTo-Json -Depth 4 | Set-Content -Path (Join-Path $toolRoot "localpdf-tool-status.json") -Encoding utf8
  $md = @()
  $md += "# LocalPDF Studio external tools"
  $md += ""
  $md += "Tool root: $toolRoot"
  $md += "Generated: $(Get-Date -Format s)"
  $md += ""
  $md += "These tools are free/open-source engines used locally by LocalPDF Studio. They are not bundled into the app distribution by default; paths are detected from this folder, PATH, common install locations, or Settings."
  $md += ""
  $md += "| Tool | Status | Detected path | License | Official URL |"
  $md += "|---|---|---|---|---|"
  foreach ($r in $records) {
    $md += "| $($r.Name) | $($r.Status) | ``$($r.Path)`` | $($r.License) | $($r.Url) |"
  }
  $md += ""
  $md += "If a row says install-attempted, winget did not provide a resolver-visible executable. Re-run this script as administrator or manually install/extract the tool under this directory."
  $md -join "`r`n" | Set-Content -Path (Join-Path $toolRoot "README.md") -Encoding utf8

  Write-Host ""
  Write-Host "Tool status written to $toolRoot\localpdf-tool-status.json and $toolRoot\README.md"
  & (Join-Path $root "scripts\verify-tools.ps1")
} finally {
  Pop-Location
}
