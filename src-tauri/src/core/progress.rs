use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProgressEvent {
    pub job_id: String,
    pub progress: u8,
    pub current_step: String,
}

impl ProgressEvent {
    pub fn new(job_id: impl Into<String>, progress: u8, current_step: impl Into<String>) -> Self {
        Self { job_id: job_id.into(), progress: progress.min(100), current_step: current_step.into() }
    }
}
