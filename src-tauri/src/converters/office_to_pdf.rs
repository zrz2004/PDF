use std::path::Path;
use std::process::Command;

use crate::{core::errors::AppError, sidecars::libreoffice};

pub fn office_to_pdf(input: &str, output_dir: &str) -> Result<(), AppError> {
    let soffice = libreoffice::path().ok_or_else(|| AppError::engine_missing("LibreOffice"))?;
    let status = Command::new(soffice)
        .arg("--headless")
        .arg("--convert-to")
        .arg("pdf")
        .arg("--outdir")
        .arg(output_dir)
        .arg(input)
        .status()?;
    if status.success() && Path::new(output_dir).exists() { Ok(()) } else { Err(AppError::new("EngineFailed", "LibreOffice 转 PDF 失败")) }
}
