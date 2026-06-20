use crate::core::errors::AppError;

pub fn pdf_to_word(input: &str, output: &str, mode: &str) -> Result<(), AppError> {
    if !std::path::Path::new(input).exists() {
        return Err(AppError::new("InputNotFound", format!("PDF 不存在：{input}")));
    }
    let _ = (output, mode);
    Err(AppError::new("EngineMissing", "PDF 转 Word 需要接入文本抽取/图片型 DOCX 生成器"))
}
