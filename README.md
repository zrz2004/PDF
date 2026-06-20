<div align="center">

# LocalPDF Studio

**A local-first, privacy-friendly desktop workbench for PDF, Office, EPUB & image conversion.**
**本地优先、注重隐私的 PDF / Office / EPUB / 图片 桌面转换工作台。**

[![Build & Release](https://github.com/zrz2004/PDF/actions/workflows/build.yml/badge.svg)](https://github.com/zrz2004/PDF/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/zrz2004/PDF/blob/main/LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/zrz2004/PDF/releases)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
[![Made with Electron](https://img.shields.io/badge/made%20with-Electron-47848F.svg)](https://www.electronjs.org/)

[Features](#-features--功能) · [Install](#-install--安装) · [Optional Engines](#%EF%B8%8F-optional-external-engines--可选外部引擎) · [Development](#-development--开发) · [Roadmap](#-roadmap--路线图)

</div>

---

> 🌐 **English below each section · 中文在前，英文在后**

LocalPDF Studio 在**你自己的电脑上**完成所有转换 —— 文件绝不上传、不联网。它内置 27+ 种工具，并可选集成 qpdf / LibreOffice / Tesseract / Ghostscript 来解锁更重度的转换能力。

> LocalPDF Studio does every conversion **on your own machine** — nothing is uploaded, nothing leaves your network. It bundles 27+ tools out of the box and can optionally integrate qpdf / LibreOffice / Tesseract / Ghostscript for heavier work.

---

## ✨ Features · 功能

绝大多数功能**无需安装任何外部引擎**即可使用。

> Most features work **without installing any external engine.**

### Built-in (no external engine needed) · 内置（无需外部引擎）

| Tool · 工具 | Description · 说明 |
|---|---|
| 🔀 Merge PDF · 合并 PDF | Combine multiple PDFs into one · 多个 PDF 顺序合并 |
| ✂️ Split PDF · 拆分 PDF | Per-page, by range, or every N pages · 按页/范围/每 N 页拆分 |
| 🗑️ Delete pages · 删页 | Remove specific pages · 删除指定页 |
| 🔢 Reorder pages · 重排 | Rearrange pages by expression · 按页码表达式重排 |
| 🔄 Rotate PDF · 旋转 | 90 / 180 / 270 degrees · 全部或指定页旋转 |
| 💧 Watermark · 水印 | Text or image watermark · 文本/图片水印 |
| 📑 Page numbers · 页码 | Header/footer numbering · 页眉页脚页码 |
| 📦 Compress PDF · 压缩 | Safe rewrite; advanced compression via Ghostscript when available · 内置安全重写，可选 Ghostscript 高级压缩 |
| 📄 PDF → Word | Editable DOCX by default, plus OCR mode & visual/image mode · 默认可编辑 DOCX，支持 OCR 与视觉保留 |
| 📊 PDF → Excel | XLSX / CSV via table heuristics · 表格/文本行列提取 |
| 📽️ PDF → PPTX | Editable text-box slides, with visual image-slide mode · 可编辑文本框幻灯片，可选视觉保留 |
| 📚 PDF → EPUB | Reflowable text or fixed-layout image EPUB · 文本型或固定布局图片型 EPUB |
| 🖼️ PDF → Images | PNG / JPG / WebP / TIFF with DPI & page range · 按页导出多格式图片 |
| 🖼️ Extract PDF images · 提取图片 | Export embedded images · 导出 PDF 内嵌图片 |
| 🖼️ Images → PDF | Merge images into a PDF · 图片排序合并为 PDF |
| 🎨 Image format convert · 图片转换 | JPG / PNG / WebP / BMP / TIFF via `sharp` · 图片格式批量转换 |
| 🍎 Pages / Numbers / Keynote | Compatibility exports (DOCX / XLSX / PPTX that Apple iWork opens) · 兼容导出 |

### Requires an external engine · 需要外部引擎

| Tool · 工具 | Engine needed · 所需引擎 |
|---|---|
| 🔐 Encrypt / Decrypt PDF · 加密/解锁 | qpdf |
| 📝 Word / Excel / PPT → PDF · Office 转 PDF | LibreOffice |
| 🔍 OCR (scanned PDF → editable DOCX/XLSX/PPTX) · 扫描件 OCR | Tesseract |

---

## 📥 Install · 安装

Download the latest release for your platform from the
[Releases page](https://github.com/zrz2004/PDF/releases):

| Platform · 平台 | Asset · 资产 |
|---|---|
| **Windows x64** | `LocalPDF-Studio-Setup-1.0.0-x64.exe` (installer · 安装版) or `...-Portable-...zip` (portable · 便携版) |
| **macOS (Intel)** | `*.dmg` (x64) |
| **macOS (Apple Silicon)** | `*.dmg` (arm64) |
| **Linux x64** | `*.AppImage` or `*.deb` |

> macOS/Linux binaries are produced automatically by GitHub Actions on release —
> if a file is missing, the build may still be in progress (check the
> [Actions tab](https://github.com/zrz2004/PDF/actions)).
>
> macOS/Linux 安装包由 GitHub Actions 自动构建；如缺失，可能构建仍在进行中（见 Actions 页）。

**Verify your download** with the `checksums-sha256.txt` attached to each release.
请用 release 附带的 `checksums-sha256.txt` 校验下载文件。

---

## ⚙️ Optional External Engines · 可选外部引擎

Built-in PDF/image/Office-writer features run **inside the app** with no extra
setup. The engines below are *optional* local executables that unlock heavier
conversions. Install them **only if you need** those features, then point the app
at them in **Settings** (or just install via PATH and the app auto-detects).

内置功能无需任何额外配置。下列引擎是**可选**的本地可执行文件，仅在你需要相应功能时安装，然后在**设置**里指定路径（或装到 PATH 中，应用会自动检测）。

| Engine · 引擎 | Use · 用途 | License · 许可 | Windows | macOS | Linux |
|---|---|---|---|---|---|
| **qpdf** | PDF 加密/解密、线性化、结构优化 · encrypt/decrypt, linearize | Apache-2.0 | `winget install QPDF.QPDF` | `brew install qpdf` | `apt install qpdf` |
| **LibreOffice** | Word/Excel/PPT 转 PDF · Office → PDF | MPL-2.0 | `winget install TheDocumentFoundation.LibreOffice` | `brew install --cask libreoffice` | `apt install libreoffice` |
| **Tesseract OCR** | 扫描件 OCR · scanned PDF OCR | Apache-2.0 | `winget install UB-Mannheim.TesseractOCR` | `brew install tesseract` | `apt install tesseract-ocr` |
| **Ghostscript** | 高级 PDF 压缩 · advanced compression | AGPL-3.0 (or commercial) | `winget install ArtifexSoftware.Ghostscript` | `brew install ghostscript` | `apt install ghostscript` |

> 📌 **Chinese OCR** also needs the Tesseract `chi_sim` traineddata. Use
> `tesseract --list-langs` or the Settings → **Test** button to confirm
> installed languages.
>
> 📌 **中文 OCR** 还需安装 Tesseract `chi_sim` 训练数据，可用 `tesseract --list-langs` 或 设置 → 测试 确认已安装语言。

> 🧭 **Distribution policy** — GPL/AGPL/native external engines are **never
> bundled** into the app by default. They remain user-installed / user-configured.
> This keeps the app freely redistributable. See
> [docs/external-engines.md](docs/external-engines.md) for resolver details.
>
> 🧭 **分发策略** —— GPL/AGPL/原生外部引擎**默认不打包**进应用，由用户自行安装/配置，以保证应用可自由分发。解析器细节见 [docs/external-engines.md](docs/external-engines.md)。

**Engine search order · 引擎查找顺序:** Settings path → `LOCALPDF_TOOL_ROOT` env → portable default folder
(`%LOCALAPPDATA%\LocalPDF\tools` on Windows, `~/.localpdf/tools` elsewhere) →
PATH / common install locations.

---

## 🧑‍💻 Development · 开发

**Prerequisites:** Node.js 22+ and npm.

```bash
git clone https://github.com/zrz2004/PDF.git
cd PDF
npm install

npm run dev          # start Vite renderer dev server · 启动 UI 开发服务器
npm run electron     # build + launch the full Electron app · 构建并启动完整应用
npm run typecheck    # TypeScript type-check · 类型检查
npm run electron:build   # package a Windows installer locally · 本地打包 Windows 安装包
```

A command palette (`Ctrl/Cmd+K`) lets you jump to any tool quickly.
命令面板（`Ctrl/Cmd+K`）可快速跳转到任意工具。

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contribution guide and
[docs/](docs/) for architecture details.

### Project layout · 项目结构

```
src/         React + TypeScript renderer (UI, tool registry, workspace)
electron/    Electron main process + local conversion engine (CommonJS)
src-tauri/   Tauri/Rust scaffold (future native sidecar — NOT the active backend)
scripts/     Build, packaging, tool install, and smoke-test helpers
docs/        Architecture & engine documentation
```

> The **Electron** app is the current production path. `src-tauri/` is a scaffold
> for future Rust-sidecar work and is **not** the active conversion backend.
>
> **Electron** 是当前生产路径；`src-tauri/` 是未来原生 sidecar 的脚手架，**并非**当前转换后端。

---

## 🏗️ Building & Releasing · 构建与发布

- **Cross-platform builds** are produced automatically by the
  [GitHub Actions workflow](.github/workflows/build.yml) on every pushed `v*`
  tag. It builds Windows, macOS (Intel + Apple Silicon), and Linux, attaches all
  binaries + checksums to a draft GitHub Release.
- **Local Windows build:** `npm run electron:build` → artifacts in `release/`.

- **跨平台构建**由 [GitHub Actions](.github/workflows/build.yml) 在每次推送 `v*` 标签时自动进行，构建 Windows / macOS（Intel + Apple Silicon）/ Linux，并把二进制与校验和附加到 GitHub Release。
- **本地 Windows 构建：** `npm run electron:build` → 产物在 `release/`。

---

## 🗺️ Roadmap · 路线图

- [ ] Native Rust/Tauri sidecar conversion backend (`src-tauri/` scaffold)
- [ ] Deeper table reconstruction for PDF → Excel
- [ ] Smarter PDF → Word layout reconstruction
- [ ] More EPUB semantic structure (TOC, footnotes)
- [ ] CLI / headless batch mode

---

## 🤝 Contributing · 贡献

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and
open an issue to discuss major changes first.
欢迎贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)，重大改动请先开 Issue 讨论。

## 📄 License · 许可证

[MIT](LICENSE) © LocalPDF Studio Contributors.

The optional external engines (qpdf, LibreOffice, Tesseract, Ghostscript) keep
their own licenses and are not bundled — install them per their terms.
可选外部引擎（qpdf / LibreOffice / Tesseract / Ghostscript）保留各自许可证，默认不打包，请按各自条款安装。
