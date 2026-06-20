use crate::{core::errors::AppError, sidecars::{pdfcpu, qpdf}};

pub fn compress_pdf(input: &str, output: &str, linearize: bool) -> Result<(), AppError> {
    let optimized = if linearize { format!("{output}.optimized.pdf") } else { output.to_string() };
    pdfcpu::run(&["optimize".into(), input.into(), optimized.clone()])?;
    if linearize {
        qpdf::run(&["--linearize".into(), optimized, output.into()])?;
    }
    Ok(())
}
