use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StoredSettings {
    pub default_output: String,
    pub theme: String,
    pub keep_failed_logs: bool,
}

impl Default for StoredSettings {
    fn default() -> Self {
        Self { default_output: "source".into(), theme: "claude-dark".into(), keep_failed_logs: true }
    }
}
