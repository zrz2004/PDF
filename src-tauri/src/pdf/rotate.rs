use crate::{core::errors::AppError, sidecars::qpdf};

pub fn rotate_pdf(input: &str, output: &str, angle: i16, pages: &str) -> Result<(), AppError> {
    let rotate = format!("--rotate=+{}:{}", angle, if pages.is_empty() { "1-z" } else { pages });
    qpdf::run(&[rotate, input.into(), output.into()])
}
