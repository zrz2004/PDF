# LocalPDF Studio v1.0.0

本地优先、注重隐私的桌面端 PDF / Office / EPUB / 图片转换工作台。首个正式版本发布。

A local-first, privacy-friendly desktop workbench for PDF, Office, EPUB, and image conversion. First public release.

---

## 亮点

- **完全本地运行** -- 所有转换在你的电脑上完成，文件绝不上传。
- **24 个工具** -- 覆盖 PDF 操作（合并、拆分、删页、重排、旋转、水印、页码、压缩、加密/解锁、PDF 转图片）、PDF 与 Office 互转、图片工作流、EPUB 转换。
- **PDF 转 Word / Excel / PPTX** -- 提供多种模式：默认可编辑模式、OCR 扫描件模式、视觉保留模式。
- **可选外部引擎** -- 支持 qpdf、LibreOffice、Tesseract、Ghostscript，按需安装，默认不打包 GPL/AGPL 引擎。
- **命令面板** -- Ctrl/Cmd+K 快速搜索和调用工具。
- **文件预览** -- PDF 页面渲染、图片预览、文件元数据查看。
- **拖拽排序** -- 通过拖拽重新排列文件顺序。

## Highlights

- **Fully local** -- all conversion runs on your machine, no uploads ever.
- **24 tools** covering PDF manipulation (merge, split, delete pages, reorder, rotate, watermark, page numbers, compress, encrypt/unlock, PDF to image), PDF-to-Office, image workflows, and EPUB.
- **PDF to Word / Excel / PPTX** with multiple modes: editable (default), OCR for scanned documents, and visual fidelity.
- **Optional external engines** -- qpdf, LibreOffice, Tesseract, Ghostscript. Install only what you need; GPL/AGPL engines are not bundled by default.
- **Command palette** -- Ctrl/Cmd+K to quickly search and invoke tools.
- **File preview** -- PDF page rendering, image preview, and file metadata display.
- **Drag-and-drop reordering** -- rearrange files by dragging.

---

## 下载

| 平台 | 资产 | 说明 |
|---|---|---|
| Windows x64 | `LocalPDF-Studio-Setup-1.0.0-x64.exe` | 安装程序 |
| Windows x64 | `LocalPDF-Studio-Portable-1.0.0-x64.zip` | 免安装便携版 |
| macOS (Intel) | `LocalPDF-Studio-1.0.0-x64.dmg` | DMG 安装镜像 |
| macOS (Intel) | `LocalPDF-Studio-1.0.0-x64-mac.zip` | ZIP 压缩包 |
| macOS (Apple Silicon) | `LocalPDF-Studio-1.0.0-arm64.dmg` | DMG 安装镜像 |
| macOS (Apple Silicon) | `LocalPDF-Studio-1.0.0-arm64-mac.zip` | ZIP 压缩包 |
| Linux x64 | `LocalPDF-Studio-1.0.0-x86_64.AppImage` | AppImage |
| Linux x64 | `localpdf-studio_1.0.0_amd64.deb` | Debian 包 |

## Downloads

| Platform | Asset | Note |
|---|---|---|
| Windows x64 | `LocalPDF-Studio-Setup-1.0.0-x64.exe` | Installer |
| Windows x64 | `LocalPDF-Studio-Portable-1.0.0-x64.zip` | Portable (no install) |
| macOS (Intel) | `LocalPDF-Studio-1.0.0-x64.dmg` | DMG installer |
| macOS (Intel) | `LocalPDF-Studio-1.0.0-x64-mac.zip` | ZIP archive |
| macOS (Apple Silicon) | `LocalPDF-Studio-1.0.0-arm64.dmg` | DMG installer |
| macOS (Apple Silicon) | `LocalPDF-Studio-1.0.0-arm64-mac.zip` | ZIP archive |
| Linux x64 | `LocalPDF-Studio-1.0.0-x86_64.AppImage` | AppImage |
| Linux x64 | `localpdf-studio_1.0.0_amd64.deb` | Debian package |

---

## 校验

请使用 Release 附件中的 `checksums-sha256.txt` 验证下载文件的完整性。

Verify your download integrity against `checksums-sha256.txt` attached to this release.

---

## 可选引擎安装 / Optional Engine Installation

大多数功能无需任何外部引擎即可使用。以下功能需要额外安装对应引擎：

Most features work without any external engine. Install the engines below only when needed:

| 引擎 Engine | 用途 Purpose | Windows | macOS | Linux |
|---|---|---|---|---|
| qpdf | 加密/解密、线性化 Encrypt/decrypt, linearize | `winget install QPDF.QPDF` | `brew install qpdf` | `apt install qpdf` |
| LibreOffice | Office 转 PDF Office to PDF | `winget install TheDocumentFoundation.LibreOffice` | `brew install --cask libreoffice` | `apt install libreoffice` |
| Tesseract | 扫描件 OCR Scanned-doc OCR | `winget install UB-Mannheim.TesseractOCR` | `brew install tesseract` | `apt install tesseract-ocr` |
| Ghostscript | 高级压缩 Advanced compression | `winget install ArtifexSoftware.Ghostscript` | `brew install ghostscript` | `apt install ghostscript` |

中文 OCR 还需安装 Tesseract `chi_sim` 训练数据。
Chinese OCR also requires the Tesseract `chi_sim` traineddata package.

---

## 说明 / Notes

- 这是 1.0.0 的第一个公开版本。/ This is the first public release of v1.0.0.
- 完整功能列表与使用方式请见 [README](https://github.com/zrz2004/PDF#readme)。/ For the full feature list and usage guide, see the [README](https://github.com/zrz2004/PDF#readme).
- 发现问题请提 [Issue](https://github.com/zrz2004/PDF/issues)。/ Found a bug? Please open an [Issue](https://github.com/zrz2004/PDF/issues).

macOS 和 Linux 安装包由 GitHub Actions CI 自动构建并上传。如果文件未显示，请查看 Actions 运行状态。
macOS and Linux builds are produced automatically by GitHub Actions CI. If assets are missing, the workflow run may still be in progress.
