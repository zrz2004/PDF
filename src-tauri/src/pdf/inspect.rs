use serde::{Deserialize, Serialize};
use crate::core::errors::AppError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PdfInspection {
    pub pages: u32,
    pub encrypted: bool,
}

pub fn inspect_pdf(path: &str) -> Result<PdfInspection, AppError> {
    if !std::path::Path::new(path).exists() {
        return Err(AppError::new("InputNotFound", format!("PDF 不存在：{path}")));
    }
    Ok(PdfInspection { pages: 1, encrypted: false })
}
