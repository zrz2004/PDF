use crate::{core::errors::AppError, sidecars::qpdf};

pub fn keep_pages(input: &str, keep_range: &str, output: &str) -> Result<(), AppError> {
    if keep_range.trim().is_empty() {
        return Err(AppError::new("InvalidPageRange", "保留页面不能为空"));
    }
    qpdf::run(&[input.into(), "--pages".into(), ".".into(), keep_range.into(), "--".into(), output.into()])
}
