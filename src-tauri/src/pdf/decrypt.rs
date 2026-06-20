use crate::{core::errors::AppError, sidecars::qpdf};

pub fn decrypt_pdf(input: &str, output: &str, password: &str) -> Result<(), AppError> {
    qpdf::run(&[format!("--password={password}"), "--decrypt".into(), input.into(), output.into()])
}
