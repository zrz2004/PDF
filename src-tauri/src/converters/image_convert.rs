use crate::core::errors::AppError;

pub fn convert_image(input: &str, output: &str, format: &str, quality: u8) -> Result<(), AppError> {
    if !std::path::Path::new(input).exists() {
        return Err(AppError::new("InputNotFound", format!("图片不存在：{input}")));
    }
    let _ = (output, format, quality);
    Err(AppError::new("EngineMissing", "需要启用 Rust image 编码器后才能执行图片格式转换"))
}
