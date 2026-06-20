use std::process::Command;

use crate::core::errors::AppError;

#[tauri::command]
pub async fn open_output_location(path: String) -> Result<(), AppError> {
    Command::new("explorer").arg(path).spawn()?;
    Ok(())
}
