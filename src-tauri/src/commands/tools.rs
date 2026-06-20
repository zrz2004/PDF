use serde::{Deserialize, Serialize};

use crate::core::errors::AppError;
use crate::core::tool_registry::{ToolDefinition, TOOLS};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    pub valid: bool,
    pub warnings: Vec<String>,
}

#[tauri::command]
pub async fn list_tools() -> Result<Vec<ToolDefinition>, AppError> {
    Ok(TOOLS.to_vec())
}

#[tauri::command]
pub async fn validate_inputs(tool_id: String, files: Vec<String>) -> Result<ValidationResult, AppError> {
    let tool = crate::core::tool_registry::get_tool(&tool_id)
        .ok_or_else(|| AppError::new("UnsupportedTool", format!("未知工具：{tool_id}")))?;
    let mut warnings = Vec::new();
    for file in files {
        let ext = std::path::Path::new(&file)
            .extension()
            .and_then(|value| value.to_str())
            .unwrap_or_default()
            .to_ascii_lowercase();
        if !tool.accepted_extensions.iter().any(|allowed| *allowed == ext) {
            warnings.push(format!("文件格式可能不受支持：{file}"));
        }
    }
    Ok(ValidationResult { valid: warnings.is_empty(), warnings })
}
