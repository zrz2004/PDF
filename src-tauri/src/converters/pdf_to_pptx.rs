use crate::core::errors::AppError;

pub fn pdf_to_pptx(input: &str, output: &str, dpi: u32) -> Result<(), AppError> {
    if !std::path::Path::new(input).exists() {
        return Err(AppError::new("InputNotFound", format!("PDF 不存在：{input}")));
    }
    let _ = (output, dpi);
    Err(AppError::new("EngineMissing", "PDF 转 PPTX 需要接入 PDFium 渲染和 PPTX 生成器"))
}
