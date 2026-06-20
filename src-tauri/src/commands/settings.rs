use serde::{Deserialize, Serialize};

use crate::core::errors::AppError;
use crate::sidecars::{libreoffice, pdfcpu, pdfium, qpdf, tesseract};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineStatus {
    pub id: String,
    pub label: String,
    pub available: bool,
    pub version: Option<String>,
    pub path: Option<String>,
    pub note: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub default_output: String,
    pub theme: String,
    pub keep_failed_logs: bool,
}

#[tauri::command]
pub async fn detect_engines() -> Result<Vec<EngineStatus>, AppError> {
    Ok(vec![
        qpdf::detect(),
        pdfcpu::detect(),
        pdfium::detect(),
        libreoffice::detect(),
        tesseract::detect(),
        EngineStatus { id: "image".into(), label: "Rust image".into(), available: true, version: None, path: None, note: "内置图片处理".into() },
        EngineStatus { id: "office-writer".into(), label: "Office writer".into(), available: true, version: None, path: None, note: "生成 Office 兼容文件".into() },
        EngineStatus { id: "epub".into(), label: "EPUB builder".into(), available: true, version: None, path: None, note: "生成 EPUB 文件".into() },
    ])
}

#[tauri::command]
pub async fn load_settings() -> Result<Settings, AppError> {
    Ok(Settings { default_output: "source".into(), theme: "claude-dark".into(), keep_failed_logs: true })
}

#[tauri::command]
pub async fn save_settings(_settings: Settings) -> Result<(), AppError> {
    Ok(())
}
