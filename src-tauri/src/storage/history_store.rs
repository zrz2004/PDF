use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryItem {
    pub id: String,
    pub tool_title: String,
    pub input_count: usize,
    pub output_directory: String,
    pub status: String,
    pub finished_at: DateTime<Utc>,
}
