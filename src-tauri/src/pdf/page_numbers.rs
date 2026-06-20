use crate::{core::errors::AppError, sidecars::pdfcpu};

pub fn add_page_numbers(input: &str, output: &str, format: &str, position: &str) -> Result<(), AppError> {
    let descriptor = format!("font:Helvetica, points:11, pos:{position}, off:0 18") ;
    pdfcpu::run(&["watermark".into(), "add".into(), "-mode".into(), "text".into(), "--".into(), format.into(), descriptor, input.into(), output.into()])
}
