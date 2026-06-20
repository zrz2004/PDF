use std::path::PathBuf;

use directories::ProjectDirs;
use uuid::Uuid;

use crate::core::errors::AppError;

pub fn job_temp_dir() -> Result<PathBuf, AppError> {
    let dirs = ProjectDirs::from("com", "localpdf", "LocalPDF Studio")
        .ok_or_else(|| AppError::new("TempUnavailable", "无法定位本地缓存目录"))?;
    let dir = dirs.cache_dir().join("temp").join(Uuid::new_v4().to_string());
    std::fs::create_dir_all(&dir)?;
    Ok(dir)
}
