# LocalPDF Studio v1.0.0

**A local-first, privacy-friendly desktop workbench for PDF, Office, EPUB, and image conversion.** First public release.

---

# 中文

**LocalPDF Studio v1.0.0** —— 本地优先、注重隐私的 PDF / Office / EPUB / 图片转换工作台，首个正式版本。

## ✨ 亮点 / Highlights

- 🔒 **完全本地运行 / Fully local** — 所有转换在你的电脑上完成，文件绝不上传。
- 📄 **丰富的 PDF 工具** — 合并、拆分、删页、重排、旋转、水印、页码、压缩、加密/解锁、PDF 转图片。
- 📑 **PDF ↔ Office** — PDF 转 Word/Excel/PPTX（默认可编辑，支持 OCR 扫描件与视觉保留模式），Office 转 PDF。
- 🖼️ **图片与 EPUB** — 图片转 PDF、图片格式转换、PDF 提取图片、PDF 转 EPUB。
- ⚙️ **可选外部引擎** — qpdf / LibreOffice / Tesseract / Ghostscript，由用户自行安装配置（默认不打包 GPL/AGPL 引擎）。
- ⌨️ **命令面板** — `Ctrl/Cmd+K` 快速搜索工具。

## 📦 下载 / Downloads

| 平台 Platform | 资产 Asset | 说明 Note |
|---|---|---|
| Windows x64 | `LocalPDF-Studio-Setup-1.0.0-x64.exe` | 安装程序 Installer |
| Windows x64 | `LocalPDF-Studio-Portable-1.0.0-x64.zip` | 免安装便携版 Portable |
| macOS (Intel) | `*.dmg` / `*.zip` | x64 |
| macOS (Apple Silicon) | `*.dmg` / `*.zip` | arm64 |
| Linux x64 | `*.AppImage` / `*.deb` | AppImage / deb |

> macOS/Linux 安装包由 GitHub Actions 自动构建并上传，请稍候片刻。如未显示，请查看 Actions 运行状态。
> macOS/Linux builds are produced automatically by GitHub Actions — if they are missing, the run may still be in progress.

请用 `checksums-sha256.txt` 校验下载。 / Verify your download with `checksums-sha256.txt`.

## ⚙️ 可选引擎安装 / Optional Engines

大多数功能**无需任何外部引擎**即可使用。以下功能需要外部引擎（按需安装）：
Most features need **no external engine**. Install these only when you need them:

| 引擎 Engine | 用途 Use | Windows | macOS | Linux |
|---|---|---|---|---|
| qpdf | 加密/解密、线性化 | `winget install QPDF.QPDF` | `brew install qpdf` | `apt install qpdf` |
| LibreOffice | Office → PDF | `winget install TheDocumentFoundation.LibreOffice` | `brew install --cask libreoffice` | `apt install libreoffice` |
| Tesseract | 扫描件 OCR | `winget install UB-Mannheim.TesseractOCR` | `brew install tesseract` | `apt install tesseract-ocr` |
| Ghostscript | 高级压缩 | `winget install ArtifexSoftware.Ghostscript` | `brew install ghostscript` | `apt install ghostscript` |

中文 OCR 还需安装 Tesseract `chi_sim` 训练数据。 / Chinese OCR also needs the Tesseract `chi_sim` traineddata.

## 📝 说明 / Notes

- 这是 **1.0.0** 的第一个公开版本。
- 完整功能列表与使用方式请见 [README](https://github.com/zrz2004/PDF#readme)。
- 发现问题请提 [Issue](https://github.com/zrz2004/PDF/issues)。

感谢使用！/ Thanks for using LocalPDF Studio!
