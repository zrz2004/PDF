use serde::Serialize;
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, Serialize)]
pub struct AppError {
    pub code: String,
    pub message: String,
    pub details: Option<String>,
}

impl AppError {
    pub fn new(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self { code: code.into(), message: message.into(), details: None }
    }

    pub fn with_details(code: impl Into<String>, message: impl Into<String>, details: impl Into<String>) -> Self {
        Self { code: code.into(), message: message.into(), details: Some(details.into()) }
    }

    pub fn engine_missing(engine: &str) -> Self {
        Self::new("EngineMissing", format!("转换引擎不可用：{engine}"))
    }
}

impl Display for AppError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}: {}", self.code, self.message)
    }
}

impl std::error::Error for AppError {}

impl From<std::io::Error> for AppError {
    fn from(value: std::io::Error) -> Self {
        Self::with_details("IoError", "文件或进程操作失败", value.to_string())
    }
}
