use crate::core::errors::AppError;

pub fn pdf_to_excel(input: &str, output: &str, mode: &str) -> Result<(), AppError> {
    if !std::path::Path::new(input).exists() {
        return Err(AppError::new("InputNotFound", format!("PDF 不存在：{input}")));
    }
    let _ = (output, mode);
    Err(AppError::new("EngineMissing", "PDF 转 Excel 需要接入表格抽取器"))
}
