use crate::commands::settings::EngineStatus;
use crate::sidecars::process::{candidate_in_path, version};

pub fn detect() -> EngineStatus {
    let path = candidate_in_path("tesseract.exe").or_else(|| candidate_in_path("tesseract"));
    let version = path.as_deref().and_then(|p| version(p, &["--version"]));
    EngineStatus { id: "tesseract".into(), label: "Tesseract OCR".into(), available: path.is_some(), version, path: path.map(|p| p.display().to_string()), note: "扫描件 OCR，可选增强".into() }
}
