use crate::core::errors::AppError;

pub fn render_page_placeholder(path: &str, page: u32) -> Result<Vec<u8>, AppError> {
    if !std::path::Path::new(path).exists() {
        return Err(AppError::new("InputNotFound", format!("PDF 不存在：{path}")));
    }
    let _ = page;
    Ok(Vec::new())
}
