use crate::core::errors::AppError;
use crate::core::job_manager::{self, JobDetail, JobRequest};

#[tauri::command]
pub async fn create_job(request: JobRequest) -> Result<JobDetail, AppError> {
    job_manager::create_job(request)
}

#[tauri::command]
pub async fn start_job(job_id: String) -> Result<JobDetail, AppError> {
    let _job = job_manager::update_job(&job_id, "running", 5, "验证输入")?;
    let _job = job_manager::update_job(&job_id, "running", 30, "准备转换引擎")?;
    let _job = job_manager::update_job(&job_id, "running", 65, "执行本地转换")?;
    let _job = job_manager::update_job(&job_id, "running", 90, "校验输出")?;
    job_manager::update_job(&job_id, "succeeded", 100, "完成")
}

#[tauri::command]
pub async fn cancel_job(job_id: String) -> Result<JobDetail, AppError> {
    job_manager::update_job(&job_id, "cancelled", 0, "已取消")
}

#[tauri::command]
pub async fn get_job(job_id: String) -> Result<JobDetail, AppError> {
    job_manager::get_job(&job_id)
}

#[tauri::command]
pub async fn list_jobs() -> Result<Vec<JobDetail>, AppError> {
    job_manager::list_jobs()
}
