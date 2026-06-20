use chrono::{DateTime, Utc};
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use uuid::Uuid;

use crate::core::errors::AppError;
use crate::core::tool_registry::get_tool;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InputFile {
    pub name: String,
    pub path: String,
    pub size: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JobRequest {
    pub tool_id: String,
    pub input_files: Vec<InputFile>,
    pub output_directory: Option<String>,
    pub options: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JobLogEntry {
    pub timestamp: DateTime<Utc>,
    pub level: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JobDetail {
    pub id: String,
    pub tool_id: String,
    pub tool_title: String,
    pub status: String,
    pub progress: u8,
    pub current_step: String,
    pub input_files: Vec<InputFile>,
    pub output_files: Vec<String>,
    pub logs: Vec<JobLogEntry>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub error: Option<String>,
}

static JOBS: Lazy<Mutex<Vec<JobDetail>>> = Lazy::new(|| Mutex::new(Vec::new()));

fn log(level: &str, message: impl Into<String>) -> JobLogEntry {
    JobLogEntry { timestamp: Utc::now(), level: level.to_string(), message: message.into() }
}

pub fn create_job(request: JobRequest) -> Result<JobDetail, AppError> {
    let tool = get_tool(&request.tool_id)
        .ok_or_else(|| AppError::new("UnsupportedTool", format!("未知工具：{}", request.tool_id)))?;
    if request.input_files.is_empty() {
        return Err(AppError::new("InputNotFound", "请先添加至少一个输入文件"));
    }
    let now = Utc::now();
    let job = JobDetail {
        id: Uuid::new_v4().to_string(),
        tool_id: tool.id.to_string(),
        tool_title: tool.title.to_string(),
        status: "queued".to_string(),
        progress: 0,
        current_step: "等待开始".to_string(),
        input_files: request.input_files,
        output_files: vec![],
        logs: vec![log("info", format!("已创建 {} 任务", tool.title))],
        created_at: now,
        updated_at: now,
        error: None,
    };
    JOBS.lock().map_err(|_| AppError::new("StateLock", "任务队列被锁定"))?.insert(0, job.clone());
    Ok(job)
}

pub fn list_jobs() -> Result<Vec<JobDetail>, AppError> {
    Ok(JOBS.lock().map_err(|_| AppError::new("StateLock", "任务队列被锁定"))?.clone())
}

pub fn get_job(id: &str) -> Result<JobDetail, AppError> {
    JOBS.lock()
        .map_err(|_| AppError::new("StateLock", "任务队列被锁定"))?
        .iter()
        .find(|job| job.id == id)
        .cloned()
        .ok_or_else(|| AppError::new("JobNotFound", format!("找不到任务：{id}")))
}

pub fn update_job(id: &str, status: &str, progress: u8, step: &str) -> Result<JobDetail, AppError> {
    let mut jobs = JOBS.lock().map_err(|_| AppError::new("StateLock", "任务队列被锁定"))?;
    let job = jobs.iter_mut().find(|job| job.id == id)
        .ok_or_else(|| AppError::new("JobNotFound", format!("找不到任务：{id}")))?;
    job.status = status.to_string();
    job.progress = progress.min(100);
    job.current_step = step.to_string();
    job.updated_at = Utc::now();
    job.logs.push(log("info", step));
    Ok(job.clone())
}

pub fn fail_job(id: &str, message: &str) -> Result<JobDetail, AppError> {
    let mut jobs = JOBS.lock().map_err(|_| AppError::new("StateLock", "任务队列被锁定"))?;
    let job = jobs.iter_mut().find(|job| job.id == id)
        .ok_or_else(|| AppError::new("JobNotFound", format!("找不到任务：{id}")))?;
    job.status = "failed".to_string();
    job.error = Some(message.to_string());
    job.current_step = "失败".to_string();
    job.updated_at = Utc::now();
    job.logs.push(log("error", message));
    Ok(job.clone())
}
