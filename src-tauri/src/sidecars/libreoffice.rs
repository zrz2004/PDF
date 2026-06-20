use std::path::PathBuf;

use crate::commands::settings::EngineStatus;
use crate::sidecars::process::{candidate_in_path, version};

pub fn path() -> Option<PathBuf> {
    candidate_in_path("soffice.exe")
        .or_else(|| candidate_in_path("libreoffice.exe"))
        .or_else(|| {
            let program_files = std::env::var_os("ProgramFiles")?;
            let candidate = PathBuf::from(program_files).join("LibreOffice").join("program").join("soffice.exe");
            if candidate.exists() { Some(candidate) } else { None }
        })
}

pub fn detect() -> EngineStatus {
    let path = path();
    let version = path.as_deref().and_then(|p| version(p, &["--version"]));
    EngineStatus { id: "libreoffice".into(), label: "LibreOffice".into(), available: path.is_some(), version, path: path.map(|p| p.display().to_string()), note: "Word/Excel/PPT 转 PDF".into() }
}
