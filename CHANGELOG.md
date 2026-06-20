# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-19

First public release.

### Added
- **PDF tools (built-in, no external engines):** merge, split, delete pages, reorder pages, rotate pages, watermark, page numbers, compress (safe rewrite), and basic PDF rewrite.
- **PDF to Office:** PDF→Word (editable DOCX by default, OCR mode, visual/image mode), PDF→Excel (XLSX/CSV via table heuristics), PDF→PPTX (editable text-box slides, with visual image-slide mode).
- **PDF to EPUB:** reflowable text EPUB or fixed-layout image EPUB.
- **PDF to images:** PNG/JPG/WebP/TIFF export with page-range and DPI control.
- **Image workflows:** images→PDF, image format conversion (JPG/PNG/WebP/BMP/TIFF) via `sharp`, embedded PDF image extraction.
- **Apple iWork compatibility:** Pages-compatible DOCX, Numbers-compatible XLSX, Keynote-compatible PPTX.
- **External engine integration:** qpdf (encrypt/decrypt, linearization), LibreOffice (Office→PDF), Tesseract OCR (scanned PDF OCR), Ghostscript (advanced compression) — all user-installed/user-configured, never bundled.
- **App experience:** command palette (`Ctrl/Cmd+K`), job history, settings page with per-engine path configuration and built-in self-tests.
- **Cross-platform build pipeline:** GitHub Actions matrix building Windows, macOS, and Linux artifacts on tag push.
- Standard community files: MIT LICENSE, CHANGELOG, CONTRIBUTING, SECURITY, CODE OF_CONDUCT, issue templates, and `.editorconfig`.

### Changed
- Generalized external-engine resolver defaults to portable, cross-platform paths (`%LOCALAPPDATA%\LocalPDF\tools` on Windows, `~/.localpdf/tools` elsewhere) instead of developer-machine paths.
- README rewritten as bilingual (English + 中文) with a full feature matrix and per-platform engine install instructions.

### Distribution
- External GPL/AGPL/native engines remain user-installed by policy. Built-in capabilities work without any external engine.
