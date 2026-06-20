use crate::{core::errors::AppError, sidecars::pdfcpu};

pub fn add_text_watermark(input: &str, output: &str, text: &str, opacity: u8, pages: Option<&str>) -> Result<(), AppError> {
    let mut args = vec!["watermark".into(), "add".into(), "-mode".into(), "text".into(), "--".into(), text.into(), format!("op:{opacity}, rot:45, pos:c"), input.into(), output.into()];
    if let Some(pages) = pages { args.splice(2..2, ["-pages".into(), pages.into()]); }
    pdfcpu::run(&args)
}
