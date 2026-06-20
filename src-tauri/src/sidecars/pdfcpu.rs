use std::path::{Path, PathBuf};

use crate::commands::settings::EngineStatus;
use crate::core::errors::AppError;
use crate::sidecars::process::{candidate_in_path, run_command, version};

pub fn path() -> Option<PathBuf> {
    let local = std::env::current_exe().ok()?.parent()?.join("binaries").join("windows-x86_64").join("pdfcpu.exe");
    if local.exists() { return Some(local); }
    candidate_in_path("pdfcpu.exe").or_else(|| candidate_in_path("pdfcpu"))
}

pub fn detect() -> EngineStatus {
    let path = path();
    let version = path.as_deref().and_then(|p| version(p, &["version"]));
    EngineStatus { id: "pdfcpu".into(), label: "pdfcpu".into(), available: path.is_some(), version, path: path.map(|p| p.display().to_string()), note: "水印、页码、压缩、图像提取".into() }
}

pub fn require() -> Result<PathBuf, AppError> {
    path().ok_or_else(|| AppError::engine_missing("pdfcpu"))
}

pub fn run(args: &[String]) -> Result<(), AppError> {
    let program = require()?;
    let output = run_command(Path::new(&program), args)?;
    if output.status == 0 { Ok(()) } else { Err(AppError::with_details("EngineFailed", "pdfcpu 执行失败", output.stderr)) }
}
