use crate::{core::errors::AppError, sidecars::qpdf};

pub fn reorder_pdf(input: &str, page_order: &str, output: &str) -> Result<(), AppError> {
    if page_order.trim().is_empty() {
        return Err(AppError::new("InvalidPageRange", "页面顺序不能为空"));
    }
    qpdf::run(&[input.into(), "--pages".into(), ".".into(), page_order.into(), "--".into(), output.into()])
}
