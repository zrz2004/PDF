$ErrorActionPreference = "Stop"
$Out = "THIRD_PARTY_NOTICES.md"
@"
# Third Party Notices

This file must be completed before distribution.

## Bundled / expected engines

- qpdf — Apache-2.0
- pdfcpu — Apache-2.0
- PDFium — BSD-style notices required
- LibreOffice — MPL/LGPL notices required if bundled
- Tauri and Rust crates — see Cargo.lock after Rust build
- npm packages — see package-lock.json

## Explicitly not bundled by default

- Ghostscript — AGPL/commercial, user-configured only
- MuPDF/PyMuPDF — AGPL/commercial, not bundled by default
- Poppler — GPL, not bundled by default
"@ | Set-Content -LiteralPath $Out -Encoding utf8
Write-Host "Wrote $Out"
