use crate::core::errors::AppError;

pub fn pages_compat(input: &str, output: &str) -> Result<(), AppError> {
    crate::converters::pdf_to_word::pdf_to_word(input, output, "docx-compatible")
}

pub fn numbers_compat(input: &str, output: &str) -> Result<(), AppError> {
    crate::converters::pdf_to_excel::pdf_to_excel(input, output, "xlsx-compatible")
}

pub fn keynote_compat(input: &str, output: &str) -> Result<(), AppError> {
    crate::converters::pdf_to_pptx::pdf_to_pptx(input, output, 200)
}
