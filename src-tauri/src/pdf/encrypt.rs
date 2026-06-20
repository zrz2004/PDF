use crate::{core::errors::AppError, sidecars::qpdf};

pub fn encrypt_pdf(input: &str, output: &str, user_password: &str, owner_password: &str, bits: u16) -> Result<(), AppError> {
    qpdf::run(&["--encrypt".into(), user_password.into(), owner_password.into(), bits.to_string(), "--".into(), input.into(), output.into()])
}
