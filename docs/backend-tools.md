# Backend Tools

## Built-in Electron engine

The Electron build includes a local JavaScript/Node conversion engine:

- `pdf-lib`: merge, split, delete pages, reorder, rotate, watermark, page numbers, and basic PDF save/rewrite compression.
- `pdf-parse`: PDF text extraction, PDF screenshot rendering, table heuristics, and embedded image extraction.
- `sharp`: image format conversion and image normalization before PDF embedding.
- `docx`: Word-compatible `.docx` generation for editable text exports, OCR text exports, and explicit visual/image fallback.
- `xlsx`: `.xlsx` generation from editable PDF table/text heuristics or OCR text heuristics.
- `pptxgenjs`: editable text-box `.pptx` generation by default, with explicit visual/image slide fallback.
- `jszip`: basic text or fixed-layout `.epub` generation.

## External engines

External engines are configured by user path or detected from `LOCALPDF_TOOL_ROOT`, the portable default tool folders (`%LOCALAPPDATA%\LocalPDF\tools` on Windows, `~/.localpdf/tools` elsewhere), PATH, and common install locations. The same resolver is used by Settings, self-tests, smoke scripts, and conversion execution.

- `qpdf`: encrypt/decrypt and optional PDF linearization/structure optimization.
- `LibreOffice`: Word/Excel/PPT/ODT/ODS/ODP to PDF through `soffice` headless conversion.
- `Tesseract`: OCR for scanned PDF-to-DOCX/XLSX/PPTX modes. Chinese OCR requires installed traineddata such as `chi_sim`.
- `Ghostscript`: optional advanced PDF compression for balanced/strong compression levels.

## Optional future engines

- `pdfcpu`: still referenced by the Tauri/Rust scaffold and may be reintroduced as a native sidecar, but Electron PDF page editing currently uses `pdf-lib`.

## Distribution rule

Avoid bundling GPL/AGPL/native tools by default. Keep them as user-configured engines or require a separate licensing/distribution decision.
