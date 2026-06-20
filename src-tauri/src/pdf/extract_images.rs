use crate::{core::errors::AppError, sidecars::pdfcpu};

pub fn extract_images(input: &str, output_dir: &str, pages: Option<&str>) -> Result<(), AppError> {
    let mut args = vec!["extract".into(), "-mode".into(), "image".into()];
    if let Some(pages) = pages { args.push("-pages".into()); args.push(pages.into()); }
    args.push(input.into());
    args.push(output_dir.into());
    pdfcpu::run(&args)
}
