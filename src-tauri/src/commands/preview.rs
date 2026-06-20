use serde::{Deserialize, Serialize};

use crate::core::errors::AppError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PdfInfo {
    pub path: String,
    pub pages: u32,
    pub encrypted: bool,
    pub title: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RenderPdfPageRequest {
    pub path: String,
    pub page: u32,
    pub zoom: f32,
    pub password: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RenderedPage {
    pub page: u32,
    pub width: u32,
    pub height: u32,
    pub data_url: Option<String>,
}

#[tauri::command]
pub async fn get_pdf_info(path: String, _password: Option<String>) -> Result<PdfInfo, AppError> {
    Ok(PdfInfo { path, pages: 1, encrypted: false, title: None })
}

#[tauri::command]
pub async fn render_pdf_page(request: RenderPdfPageRequest) -> Result<RenderedPage, AppError> {
    Ok(RenderedPage { page: request.page, width: 800, height: 1100, data_url: None })
}

#[tauri::command]
pub async fn render_pdf_thumbnail(request: RenderPdfPageRequest) -> Result<RenderedPage, AppError> {
    Ok(RenderedPage { page: request.page, width: 160, height: 220, data_url: None })
}
