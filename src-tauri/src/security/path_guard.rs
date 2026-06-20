use std::path::{Path, PathBuf};

use crate::core::errors::AppError;

pub fn user_selected_path(path: impl AsRef<Path>) -> Result<PathBuf, AppError> {
    let path = path.as_ref();
    if path.as_os_str().is_empty() {
        return Err(AppError::new("InputNotFound", "路径不能为空"));
    }
    Ok(path.to_path_buf())
}

pub fn sanitize_log_path(path: &str) -> String {
    path.replace('\\', "\\\\")
}
