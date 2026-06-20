# Conversion Quality Notes

PDF page operations, security operations, PDF-to-image, image conversion, and image-to-PDF can be made deterministic and high confidence.

PDF-to-Word/Excel/PPTX is inherently difficult because PDFs usually store visual positions instead of document semantics. The app therefore exposes multiple modes:

- Text/table extraction mode for editable outputs.
- Image mode for visual fidelity.
- OCR mode as an optional enhancement for scanned PDFs.

Apple iWork formats are implemented as compatibility outputs on Windows:

- Pages-compatible output: DOCX
- Numbers-compatible output: XLSX
- Keynote-compatible output: PPTX
