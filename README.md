<div align="center">

# LocalPDF Studio

**A local-first, privacy-friendly desktop workbench for PDF, Office, EPUB and image conversion.**

**本地优先、注重隐私的 PDF / Office / EPUB / 图片桌面转换工作台。**

[![Build & Release](https://github.com/zrz2004/PDF/actions/workflows/build.yml/badge.svg)](https://github.com/zrz2004/PDF/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/zrz2004/PDF/blob/main/LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/zrz2004/PDF/releases)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
[![Made with Electron](https://img.shields.io/badge/made%20with-Electron-47848F.svg)](https://www.electronjs.org/)

[功能 / Features](#功能--features) | [工具列表 / Tools](#工具列表--tool-reference) | [安装 / Install](#安装--install) | [外部引擎 / Engines](#可选外部引擎--optional-external-engines) | [开发 / Development](#开发--development) | [构建 / Building](#构建与发布--building--releasing) | [路线图 / Roadmap](#路线图--roadmap)

</div>

---

> **English below each section / 中文在前，英文在后**

LocalPDF Studio 在**你自己的电脑上**完成所有转换 -- 文件绝不上传、不联网。内置 **24 种工具**，其中 19 种无需任何外部引擎即可运行，另有 5 种可选集成 qpdf / LibreOffice / Tesseract / Ghostscript 来解锁更重度的转换能力。

> LocalPDF Studio does every conversion **on your own machine** -- nothing is uploaded, nothing leaves your network. It bundles **24 tools**, 19 of which work without any external engine, plus 5 that optionally integrate qpdf / LibreOffice / Tesseract / Ghostscript for heavier work.

---

## 功能 / Features

绝大多数功能**无需安装任何外部引擎**即可使用。

> Most features work **without installing any external engine.**

### 内置工具（无需外部引擎）/ Built-in Tools (No External Engine Needed)

#### PDF 操作 / PDF Manipulation

使用 pdf-lib + pdfcpu 实现。

> Powered by pdf-lib + pdfcpu.

| 工具 / Tool | 说明 / Description |
|---|---|
| **merge-pdf** / 合并 PDF | 将多个 PDF 顺序合并为一个文件。/ Merge multiple PDFs into one document. |
| **split-pdf** / 拆分 PDF | 支持三种模式：按每页拆分、按页码范围拆分、按每 N 页拆分。/ Split by every page, by page ranges, or every N pages. |
| **delete-pdf-pages** / 删除页面 | 删除 PDF 中的指定页面。/ Remove specific pages from a PDF. |
| **reorder-pdf** / 重排页面 | 按页码表达式重排页面（如 `3,1,2,4-end`）。/ Rearrange pages by expression (e.g. `3,1,2,4-end`). |
| **rotate-pdf** / 旋转 PDF | 支持 90/180/270 度旋转，可作用于全部页面或选定页面。/ 90/180/270 degree rotation, all or selected pages. |
| **watermark-pdf** / 水印 | 添加文本或图片水印，支持透明度和旋转角度控制。/ Text or image watermark with opacity and angle control. |
| **pdf-page-numbers** / 页码 | 在页眉或页脚添加页码，支持多种编号格式。/ Page numbering in header or footer with multiple formats. |
| **compress-pdf** / 压缩 PDF | 内置安全重写压缩；如已安装 Ghostscript 或 qpdf，可自动增强压缩效果。/ Safe rewrite compression; optionally enhanced by Ghostscript or qpdf when available. |

#### PDF 转换 / PDF Conversion

使用 pdf-parse + docx/xlsx/pptxgenjs 实现。

> Powered by pdf-parse + docx/xlsx/pptxgenjs.

| 工具 / Tool | 说明 / Description | 转换模式 / Conversion Modes |
|---|---|---|
| **pdf-to-word** / PDF 转 Word | PDF 转 DOCX。/ PDF to DOCX. | `editable-docx`（默认，可编辑文档）/ default, editable document; `ocr-docx`（扫描件 OCR，需 Tesseract）/ scanned PDF OCR, requires Tesseract; `visual-docx`（图片保留视觉）/ image-based visual preservation |
| **pdf-to-excel** / PDF 转 Excel | PDF 转 XLSX/CSV。/ PDF to XLSX/CSV. | `auto`（自动检测表格）/ auto-detect tables; `per-page`（每页一个工作表）/ one sheet per page; `text-grid`（文本行列网格）/ text row-column grid; `ocr-table`（扫描件表格 OCR，需 Tesseract）/ scanned table OCR, requires Tesseract |
| **pdf-to-pptx** / PDF 转 PPTX | PDF 转 PPTX，支持宽高比控制。/ PDF to PPTX with aspect ratio control. | `editable-pptx`（可编辑文本框）/ editable text boxes; `editable-pptx-with-background`（可编辑 + 原始背景）/ editable with original background; `ocr-pptx`（扫描件 OCR，需 Tesseract）/ scanned OCR, requires Tesseract; `visual-pptx`（图片幻灯片）/ image-based slides |
| **pdf-to-images** / PDF 转图片 | PDF 转 PNG/JPG/WebP/TIFF，支持 DPI 和页码范围控制。/ PDF to PNG/JPG/WebP/TIFF with DPI and page range control. | N/A -- 直接选择输出格式、DPI 和页码范围。/ Select output format, DPI, and page range directly. |
| **pdf-to-epub** / PDF 转 EPUB | PDF 转 EPUB。/ PDF to EPUB. | `text`（可重排版文本型）/ reflowable text; `image`（固定布局图片型）/ fixed-layout image |
| **extract-pdf-images** / 提取图片 | 导出 PDF 内嵌图片，支持去重和最小尺寸过滤。/ Export embedded images with dedup and minimum size filter. | N/A -- 直接配置过滤参数。/ Configure filter parameters directly. |
| **images-to-pdf** / 图片转 PDF | 将多张图片合并为 PDF，支持页面尺寸和适配选项。/ Merge images into PDF with page size and fit options. | N/A -- 直接选择页面尺寸和适配方式。/ Select page size and fit mode directly. |
| **image-format-convert** / 图片格式转换 | 通过 sharp 批量转换 JPG/PNG/WebP/BMP/TIFF。/ Batch convert between JPG/PNG/WebP/BMP/TIFF via sharp. | N/A -- 选择目标格式即可。/ Select target format. |

#### Apple iWork 兼容 / Apple iWork Compatibility

复用上述转换引擎，输出 iWork 可打开的格式。

> Reuses the above engines to produce formats that Apple iWork can open.

| 工具 / Tool | 说明 / Description | 转换模式 / Conversion Modes |
|---|---|---|
| **pdf-to-pages** / PDF 转 Pages | PDF 转 Pages 兼容的 DOCX。/ PDF to Pages-compatible DOCX. | `editable`（可编辑）/ editable; `visual`（视觉保留）/ visual |
| **pdf-to-numbers** / PDF 转 Numbers | PDF 转 Numbers 兼容的 XLSX（表格提取）。/ PDF to Numbers-compatible XLSX (table extraction). | 与 pdf-to-excel 表格模式相同。/ Same table modes as pdf-to-excel. |
| **pdf-to-keynote** / PDF 转 Keynote | PDF 转 Keynote 兼容的 PPTX。/ PDF to Keynote-compatible PPTX. | 与 pdf-to-pptx 模式相同。/ Same modes as pdf-to-pptx. |

---

### 需要外部引擎的工具 / Tools Requiring External Engines

| 工具 / Tool | 说明 / Description | 所需引擎 / Engine Required |
|---|---|---|
| **encrypt-pdf** / 加密 PDF | AES-128/256 加密，支持用户密码和所有者密码。/ AES-128/256 encryption with user and owner passwords. | qpdf |
| **decrypt-pdf** / 解密 PDF | 移除 PDF 密码保护。/ Remove PDF password protection. | qpdf |
| **word-to-pdf** / Word 转 PDF | DOC/DOCX/RTF/ODT 转 PDF。/ DOC/DOCX/RTF/ODT to PDF. | LibreOffice |
| **excel-to-pdf** / Excel 转 PDF | XLS/XLSX/CSV/ODS 转 PDF。/ XLS/XLSX/CSV/ODS to PDF. | LibreOffice |
| **pptx-to-pdf** / PPT 转 PDF | PPT/PPTX/ODP 转 PDF。/ PPT/PPTX/ODP to PDF. | LibreOffice |

> 注意：OCR 相关模式（`ocr-docx`、`ocr-table`、`ocr-pptx`）在 pdf-to-word / pdf-to-excel / pdf-to-pptx 工具中提供，需要额外安装 Tesseract。
>
> Note: OCR modes (`ocr-docx`, `ocr-table`, `ocr-pptx`) within the pdf-to-word / pdf-to-excel / pdf-to-pptx tools require an additional Tesseract installation.

---

## 安装 / Install

从 [Releases 页面](https://github.com/zrz2004/PDF/releases) 下载对应平台的最新版本：

> Download the latest release for your platform from the [Releases page](https://github.com/zrz2004/PDF/releases):

| 平台 / Platform | 安装包 / Asset |
|---|---|
| **Windows x64** | `LocalPDF-Studio-Setup-1.0.0-x64.exe`（安装版 / installer）或 `...-Portable-...zip`（便携版 / portable） |
| **macOS (Intel)** | `*.dmg` (x64) |
| **macOS (Apple Silicon)** | `*.dmg` (arm64) |
| **Linux x64** | `*.AppImage` 或 `*.deb` |

> macOS/Linux 安装包由 GitHub Actions 自动构建；如缺失，可能构建仍在进行中（见 [Actions 页](https://github.com/zrz2004/PDF/actions)）。
>
> macOS/Linux binaries are produced automatically by GitHub Actions on release -- if a file is missing, the build may still be in progress (check the [Actions tab](https://github.com/zrz2004/PDF/actions)).

请使用 release 附带的 `checksums-sha256.txt` 校验下载文件。

> Verify your download with the `checksums-sha256.txt` attached to each release.

---

## 可选外部引擎 / Optional External Engines

内置功能无需任何额外配置即可运行。下列引擎是**可选**的本地可执行文件，仅在需要相应功能时安装。安装后在**设置**中指定路径，或直接装到 PATH 中由应用自动检测。

> Built-in features require no extra setup. The engines below are **optional** local executables -- install them only if you need those features, then point the app at them in **Settings** (or install via PATH and the app auto-detects).

### 引擎一览 / Engine Overview

| 引擎 / Engine | 用途 / Purpose | 许可证 / License |
|---|---|---|
| **qpdf** | PDF 加密/解密、线性化 / PDF encrypt/decrypt, linearization | Apache-2.0 |
| **LibreOffice** | Office 转 PDF / Office to PDF (Word, Excel, PPT) | MPL-2.0 |
| **Tesseract OCR** | 扫描件 OCR（用于 pdf-to-word/excel/pptx 的 OCR 模式）/ Scanned PDF OCR (for OCR modes in pdf-to-word/excel/pptx) | Apache-2.0 |
| **Ghostscript** | 高级 PDF 压缩（用于 compress-pdf 增强）/ Advanced PDF compression (enhances compress-pdf) | AGPL-3.0 |

### 安装命令 / Installation Commands

#### qpdf

| 平台 / Platform | 命令 / Command |
|---|---|
| Windows | `winget install QPDF.QPDF` |
| macOS | `brew install qpdf` |
| Linux | `apt install qpdf` |

#### LibreOffice

| 平台 / Platform | 命令 / Command |
|---|---|
| Windows | `winget install TheDocumentFoundation.LibreOffice` |
| macOS | `brew install --cask libreoffice` |
| Linux | `apt install libreoffice` |

#### Tesseract OCR

| 平台 / Platform | 命令 / Command |
|---|---|
| Windows | `winget install UB-Mannheim.TesseractOCR` |
| macOS | `brew install tesseract` |
| Linux | `apt install tesseract-ocr` |

> 中文 OCR 还需安装 Tesseract `chi_sim` 训练数据。使用 `tesseract --list-langs` 或设置中的**测试**按钮确认已安装语言。
>
> Chinese OCR also needs the Tesseract `chi_sim` traineddata. Use `tesseract --list-langs` or the Settings **Test** button to confirm installed languages.

#### Ghostscript

| 平台 / Platform | 命令 / Command |
|---|---|
| Windows | `winget install ArtifexSoftware.Ghostscript` |
| macOS | `brew install ghostscript` |
| Linux | `apt install ghostscript` |

### 引擎查找顺序 / Engine Search Order

1. 设置中指定的路径 / Settings path
2. `LOCALPDF_TOOL_ROOT` 环境变量 / `LOCALPDF_TOOL_ROOT` environment variable
3. 便携默认目录 / Portable default folder:
   - Windows: `%LOCALAPPDATA%\LocalPDF\tools`
   - macOS / Linux: `~/.localpdf/tools`
4. PATH 及常见安装位置 / PATH and common install locations

> 分发策略：GPL/AGPL/原生外部引擎**默认不打包**进应用，由用户自行安装和配置，以保证应用可自由分发。解析器细节见 [docs/external-engines.md](docs/external-engines.md)。
>
> Distribution policy: GPL/AGPL/native external engines are **never bundled** into the app by default. They remain user-installed / user-configured. This keeps the app freely redistributable. See [docs/external-engines.md](docs/external-engines.md) for resolver details.

---

## 开发 / Development

**前置条件：** Node.js 22+ 和 npm。

> **Prerequisites:** Node.js 22+ and npm.

```bash
git clone https://github.com/zrz2004/PDF.git
cd PDF
npm install

npm run dev              # 启动 Vite 渲染进程开发服务器 / Start Vite renderer dev server
npm run electron         # 构建并启动完整 Electron 应用 / Build + launch the full Electron app
npm run typecheck        # TypeScript 类型检查 / TypeScript type-check
npm run electron:build   # 本地打包 Windows 安装包 / Package a Windows installer locally
```

命令面板（`Ctrl/Cmd+K`）可快速跳转到任意工具。

> The command palette (`Ctrl/Cmd+K`) lets you jump to any tool quickly.

贡献指南请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)，架构细节见 [docs/](docs/) 目录。

> See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contribution guide and [docs/](docs/) for architecture details.

### 项目结构 / Project Layout

```
src/         React + TypeScript 渲染进程（UI、工具注册、工作区）
             React + TypeScript renderer (UI, tool registry, workspace)

electron/    Electron 主进程 + 本地转换引擎（CommonJS）
             Electron main process + local conversion engine (CommonJS)

src-tauri/   Tauri/Rust 脚手架（未来原生 sidecar -- 并非当前转换后端）
             Tauri/Rust scaffold (future native sidecar -- NOT the active backend)

scripts/     构建、打包、工具安装和冒烟测试脚本
             Build, packaging, tool install, and smoke-test helpers

docs/        架构与引擎文档
             Architecture and engine documentation
```

> **Electron** 是当前生产路径。`src-tauri/` 是未来原生 sidecar 的脚手架，**并非**当前转换后端。
>
> The **Electron** app is the current production path. `src-tauri/` is a scaffold for future Rust-sidecar work and is **not** the active conversion backend.

---

## 构建与发布 / Building and Releasing

- **跨平台构建**由 [GitHub Actions 工作流](.github/workflows/build.yml) 在每次推送 `v*` 标签时自动执行，构建 Windows / macOS（Intel + Apple Silicon）/ Linux 版本，并将所有二进制文件与校验和附加到 GitHub Release 草稿。
- **本地 Windows 构建：** `npm run electron:build`，产物在 `release/` 目录。

> - **Cross-platform builds** are produced automatically by the [GitHub Actions workflow](.github/workflows/build.yml) on every pushed `v*` tag. It builds Windows, macOS (Intel + Apple Silicon), and Linux, and attaches all binaries + checksums to a draft GitHub Release.
> - **Local Windows build:** `npm run electron:build` -- artifacts in `release/`.

---

## 路线图 / Roadmap

- [ ] 原生 Rust/Tauri sidecar 转换后端 / Native Rust/Tauri sidecar conversion backend
- [ ] 更深层的 PDF 转 Excel 表格重建 / Deeper table reconstruction for PDF to Excel
- [ ] 更智能的 PDF 转 Word 布局重建 / Smarter PDF to Word layout reconstruction
- [ ] 更丰富的 EPUB 语义结构（目录、脚注）/ More EPUB semantic structure (TOC, footnotes)
- [ ] CLI / 无头批量模式 / CLI / headless batch mode

---

## 贡献 / Contributing

欢迎贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)，重大改动请先开 Issue 讨论。

> Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and open an issue to discuss major changes first.

## 许可证 / License

[MIT](LICENSE) (c) LocalPDF Studio Contributors.

可选外部引擎（qpdf / LibreOffice / Tesseract / Ghostscript）保留各自许可证，默认不打包，请按各自条款安装。

> The optional external engines (qpdf, LibreOffice, Tesseract, Ghostscript) keep their own licenses and are not bundled -- install them per their terms.
