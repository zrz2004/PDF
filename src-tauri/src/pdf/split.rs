use crate::{core::errors::AppError, sidecars::qpdf};

pub fn extract_range(input: &str, range: &str, output: &str) -> Result<(), AppError> {
    qpdf::run(&[input.into(), "--pages".into(), ".".into(), range.into(), "--".into(), output.into()])
}
