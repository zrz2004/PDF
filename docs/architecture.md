# Architecture

LocalPDF Studio is a desktop application built on Electron + Node.js with a React frontend. All PDF processing happens locally on the user's machine.

```text
React UI (renderer) -> preload contextBridge -> ipcMain handlers -> conversion engine / external sidecar engines
```

The renderer process owns the workspace experience: tool grid, file list, options, preview, job progress, logs, history, and settings.

The main process owns system-level responsibilities: file I/O, child process spawning, engine detection, persistent settings, and window management.

Conversion engines are intentionally modular so GPL/AGPL components (Ghostscript, Tesseract, LibreOffice) can remain optional rather than bundled by default.

---

## Process Model

```text
+-------------------+       contextBridge        +-------------------+
|  Renderer Process | <------------------------> |   Main Process    |
|  (React + Vite)   |    electronAPI (IPC)       |   (Node.js)       |
+-------------------+                            +-------------------+
                                                         |
                                                 +-------+-------+
                                                 |               |
                                          +-------------+ +-------------+
                                          | conversion  | |  engines    |
                                          | .cjs        | |  .cjs       |
                                          | (built-in)  | | (external)  |
                                          +-------------+ +-------------+
```

### Renderer Process (src/)

React + TypeScript application bundled with Vite. Responsible for all user-facing UI.

- **State management**: Zustand stores -- job store, history store, settings store.
- **File input**: react-dropzone for drag-and-drop file selection.
- **Icons**: lucide-react.
- **Command palette**: Ctrl/Cmd+K shortcut for quick tool navigation.

### Main Process (electron/)

Node.js process running in the Electron main context. Handles privileged operations.

- **electron/main.cjs**: IPC handlers for window management, file dialogs, settings, engine detection, and conversion orchestration.
- **electron/preload.cjs**: contextBridge exposing `electronAPI` to the renderer. Runs with `contextIsolation` enabled for security.
- **electron/conversion.cjs**: 857-line CommonJS module implementing 24 tool operations (detailed below).
- **electron/engines.cjs**: Resolves and spawns external engines -- qpdf, LibreOffice, Tesseract, Ghostscript.
- **electron/engine-tests.cjs**: Self-test capabilities for each external engine.
- **electron/settings.cjs**: Persistent application settings, including user-configured engine paths.

---

## IPC Flow

All communication between renderer and main process follows a single path:

```text
Renderer component
  -> window.electronAPI.method()     (exposed by preload contextBridge)
    -> ipcMain.handle(method, ...)   (registered in main.cjs)
      -> conversion.cjs / engines.cjs (execution)
        -> output files on disk
      <- result / progress events
    <- IPC response
  <- resolved promise
```

The preload bridge is the only interface between processes. Direct Node.js access from the renderer is not permitted.

---

## Conversion Engine (electron/conversion.cjs)

The core processing module implements all 24 tool operations as a CommonJS module. It uses the following libraries:

| Library | Purpose |
|---|---|
| pdf-lib + @pdf-lib/fontkit | PDF manipulation -- merge, split, rotate, watermark, page numbers |
| pdf-parse v2.4.5 | PDF text extraction and page rendering (getScreenshot API) |
| sharp | Image processing -- format conversion, resize, data URL generation, preview IPC |
| docx | Word document generation (PDF to Word output) |
| xlsx | Excel reading and writing (PDF to Excel) |
| pptxgenjs | PowerPoint generation (PDF to PPTX) |
| jszip | EPUB archive assembly |

---

## External Engine Integration (electron/engines.cjs)

Some operations require external binaries that are not bundled with the application. The engines module resolves their paths and spawns child processes.

| Engine | Purpose |
|---|---|
| qpdf | Structural PDF manipulation |
| LibreOffice | Office format conversions |
| Tesseract | OCR (optical character recognition) |
| Ghostscript | PostScript and advanced PDF processing |

Engine paths are user-configurable via the Settings page and persisted through `electron/settings.cjs`.

---

## Renderer Architecture (src/)

### Pages

- **HomePage**: Tool grid displaying all 24 available tools.
- **SettingsPage**: Engine path configuration and application preferences.
- **HistoryPage**: Past conversion job history.

### Tool System

- **Tool registry** (`src/features/tools/registry.ts`): Defines all 24 tools with their options, required engines, and metadata. This is the single source of truth for what tools exist and how they are configured.

### Workspace Components

- **ToolWorkspace**: Top-level layout for an active tool session.
- **FileDropZone**: Drag-and-drop file input area.
- **FileList**: Selected files with drag-reorder support.
- **ConversionOptionsPanel**: Tool-specific configuration options.
- **PreviewPanel**: File preview container, delegates to format-specific preview components.
- **JobProgressPanel**: Real-time conversion progress display.
- **JobLogDrawer**: Detailed conversion log viewer.

### Preview Components

- **PdfPreview**: Real page rendering via IPC (uses pdf-parse getScreenshot in the main process, sharp for image processing).
- **ImagePreview**: Direct image display.
- **PageThumbnailStrip**: Real thumbnail rendering for page navigation.
- **OfficePreviewPlaceholder**: File metadata display for Office formats that cannot be rendered in-browser.

---

## Note on src-tauri/

The `src-tauri/` directory contains scaffolded code for a possible future Rust sidecar. It is not the active backend. All current application logic runs in the Electron main process as described above.
