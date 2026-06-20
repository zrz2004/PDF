use crate::core::errors::AppError;

pub fn pdf_to_images(input: &str, output_dir: &str, format: &str, dpi: u32) -> Result<Vec<String>, AppError> {
    if !std::path::Path::new(input).exists() {
        return Err(AppError::new("InputNotFound", format!("PDF 不存在：{input}")));
    }
    let _ = (output_dir, format, dpi);
    Err(AppError::new("EngineMissing", "需要接入 PDFium sidecar 后才能渲染 PDF 图片"))
}
