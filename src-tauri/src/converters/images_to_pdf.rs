use crate::core::errors::AppError;

pub fn images_to_pdf(images: &[String], output: &str) -> Result<(), AppError> {
    if images.is_empty() {
        return Err(AppError::new("InputNotFound", "请添加至少一张图片"));
    }
    let _ = output;
    Err(AppError::new("EngineMissing", "需要启用图片 PDF 生成器后才能执行图片转 PDF"))
}
