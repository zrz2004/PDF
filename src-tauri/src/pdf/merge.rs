use crate::{core::errors::AppError, sidecars::qpdf};

pub fn merge_pdf(inputs: &[String], output: &str) -> Result<(), AppError> {
    let mut args = vec!["--empty".to_string(), "--pages".to_string()];
    args.extend(inputs.iter().cloned());
    args.push("--".to_string());
    args.push(output.to_string());
    qpdf::run(&args)
}
