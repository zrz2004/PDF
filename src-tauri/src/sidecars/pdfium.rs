use std::path::PathBuf;

use crate::commands::settings::EngineStatus;

pub fn path() -> Option<PathBuf> {
    let local = std::env::current_exe().ok()?.parent()?.join("binaries").join("windows-x86_64").join("pdfium.dll");
    if local.exists() { Some(local) } else { None }
}

pub fn detect() -> EngineStatus {
    let path = path();
    EngineStatus { id: "pdfium".into(), label: "PDFium".into(), available: path.is_some(), version: None, path: path.map(|p| p.display().to_string()), note: "PDF 页面预览与渲染".into() }
}
