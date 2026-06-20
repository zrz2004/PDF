use std::time::Duration;

#[derive(Debug, Clone)]
pub struct SandboxPolicy {
    pub timeout: Duration,
    pub max_input_bytes: u64,
    pub max_output_bytes: u64,
}

impl Default for SandboxPolicy {
    fn default() -> Self {
        Self { timeout: Duration::from_secs(300), max_input_bytes: 1024 * 1024 * 1024, max_output_bytes: 2 * 1024 * 1024 * 1024 }
    }
}
