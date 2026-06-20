# External engines

LocalPDF Studio is local-first. Built-in PDF/image/Office-writer features run inside the Electron app; these external engines are optional local executables that unlock heavier conversions or stronger PDF processing.

## Tool root

The app resolver checks paths in this order:

1. A path saved in Settings (per engine).
2. `LOCALPDF_TOOL_ROOT`, when set.
3. Portable default folders:
   - Windows: `%LOCALAPPDATA%\LocalPDF\tools`
   - macOS / Linux: `~/.localpdf/tools`
4. PATH and common install locations (e.g. `Program Files`).

Set `LOCALPDF_TOOL_ROOT` to point the resolver at any custom folder of engines.

The project helper script attempts winget installation into the local tool root (Windows):

```powershell
.\scripts\install-external-tools.ps1
```

It writes, under the tool root:

- `README.md`
- `localpdf-tool-status.json`

If winget cannot install a package into the requested location, manually install or extract the tool under the tool root and then run:

```powershell
.\scripts\verify-tools.ps1
.\scripts\smoke-matrix.ps1
```

## Engine matrix

| Engine | Used for | License / cost note | Official source | Typical install command |
|---|---|---|---|---|
| qpdf | PDF encrypt/decrypt, linearization, structural optimization | Free/open source, Apache-2.0 | https://github.com/qpdf/qpdf | `winget install QPDF.QPDF` · `brew install qpdf` · `apt install qpdf` |
| LibreOffice | DOC/DOCX/RTF/ODT, XLS/XLSX/CSV/ODS, PPT/PPTX/ODP to PDF | Free/open source, MPL-2.0 and compatible component licenses | https://www.libreoffice.org/ | `winget install TheDocumentFoundation.LibreOffice` · `brew install --cask libreoffice` · `apt install libreoffice` |
| Tesseract OCR | Scanned PDF OCR for editable DOCX/XLSX/PPTX modes | Free/open source, Apache-2.0 | https://github.com/tesseract-ocr/tesseract | `winget install UB-Mannheim.TesseractOCR` · `brew install tesseract` · `apt install tesseract-ocr` |
| Ghostscript | Balanced/strong PDF compression via `pdfwrite` | Free/open source under AGPL-3.0, or commercial license from Artifex; user-installed only and not bundled | https://www.ghostscript.com/ | `winget install ArtifexSoftware.Ghostscript` · `brew install ghostscript` · `apt install ghostscript` |

## Manual fallback layout

The resolver searches recursively under the tool root (see above) and PATH, so these layouts are all acceptable. Windows examples (`$TOOLROOT` = `%LOCALAPPDATA%\LocalPDF\tools` or your `LOCALPDF_TOOL_ROOT`):

```text
$TOOLROOT\qpdf\bin\qpdf.exe
$TOOLROOT\libreoffice\program\soffice.exe
$TOOLROOT\libreoffice\App\libreoffice\program\soffice.exe
$TOOLROOT\tesseract\tesseract.exe
$TOOLROOT\gs\gs10.07.1\bin\gswin64c.exe
$TOOLROOT\ghostscript\bin\gswin64c.exe
```

On macOS/Linux the resolver finds the executables via PATH (`/opt/homebrew/bin`, `/usr/local/bin`, `/usr/bin`, …) automatically.

## Notes by engine

### qpdf

- Required by `encrypt-pdf` and `decrypt-pdf`.
- Optional for `compress-pdf` linearization.
- Passwords are passed to qpdf for the local process only; LocalPDF does not save them in history or settings.

### LibreOffice

- Required by `word-to-pdf`, `excel-to-pdf`, and `pptx-to-pdf`.
- LocalPDF launches it headlessly with an isolated temporary user profile to avoid profile locks.
- Conversion fidelity depends on fonts installed on the machine.

### Tesseract OCR

- Required only for OCR conversion modes.
- `eng` is required for the built-in self-test.
- Chinese OCR needs `chi_sim` traineddata. Use `tesseract --list-langs` or Settings → Test to confirm installed languages.

### Ghostscript

- Used by `compress-pdf` when level is `balanced` or `strong`.
- If Ghostscript is missing, LocalPDF falls back to safe built-in PDF rewrite and/or qpdf optimization when available.
- Because Ghostscript is AGPL/commercial, LocalPDF does not bundle it by default.
