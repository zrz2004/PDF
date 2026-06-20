pub mod commands;
pub mod converters;
pub mod core;
pub mod pdf;
pub mod security;
pub mod sidecars;
pub mod storage;

use commands::{filesystem, jobs, preview, settings, tools};

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            tools::list_tools,
            tools::validate_inputs,
            jobs::create_job,
            jobs::start_job,
            jobs::cancel_job,
            jobs::get_job,
            jobs::list_jobs,
            preview::get_pdf_info,
            preview::render_pdf_page,
            preview::render_pdf_thumbnail,
            settings::detect_engines,
            settings::load_settings,
            settings::save_settings,
            filesystem::open_output_location,
        ])
        .run(tauri::generate_context!())
        .expect("failed to run LocalPDF Studio");
}
