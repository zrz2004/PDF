use std::path::{Path, PathBuf};

use crate::core::errors::AppError;

pub fn normalize_existing_file(path: impl AsRef<Path>) -> Result<PathBuf, AppError> {
    let path = path.as_ref();
    if !path.exists() {
        return Err(AppError::new("InputNotFound", format!("输入文件不存在：{}", path.display())));
    }
    if !path.is_file() {
        return Err(AppError::new("UnsupportedFormat", format!("路径不是文件：{}", path.display())));
    }
    Ok(path.to_path_buf())
}

pub fn ensure_output_directory(path: impl AsRef<Path>) -> Result<PathBuf, AppError> {
    let path = path.as_ref();
    if !path.exists() {
        std::fs::create_dir_all(path)?;
    }
    if !path.is_dir() {
        return Err(AppError::new("OutputPermissionDenied", format!("输出路径不是文件夹：{}", path.display())));
    }
    Ok(path.to_path_buf())
}

pub fn safe_output_path(dir: &Path, stem: &str, extension: &str) -> PathBuf {
    let mut candidate = dir.join(format!("{stem}.{extension}"));
    if !candidate.exists() {
        return candidate;
    }
    for index in 1..10_000 {
        candidate = dir.join(format!("{stem}_{index}.{extension}"));
        if !candidate.exists() {
            break;
        }
    }
    candidate
}
