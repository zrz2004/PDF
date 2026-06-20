use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolDefinition {
    pub id: &'static str,
    pub title: &'static str,
    pub accepted_extensions: &'static [&'static str],
    pub output_extensions: &'static [&'static str],
    pub required_engines: &'static [&'static str],
    pub supports_batch: bool,
    pub experimental: bool,
}

pub const TOOLS: &[ToolDefinition] = &[
    ToolDefinition { id: "pdf-to-word", title: "PDF转Word", accepted_extensions: &["pdf"], output_extensions: &["docx"], required_engines: &["pdfium", "office-writer"], supports_batch: true, experimental: true },
    ToolDefinition { id: "pdf-to-excel", title: "PDF转Excel", accepted_extensions: &["pdf"], output_extensions: &["xlsx", "csv"], required_engines: &["office-writer"], supports_batch: true, experimental: true },
    ToolDefinition { id: "pdf-to-pptx", title: "PDF转PPTX", accepted_extensions: &["pdf"], output_extensions: &["pptx"], required_engines: &["pdfium"], supports_batch: true, experimental: true },
    ToolDefinition { id: "pdf-to-images", title: "PDF转图片", accepted_extensions: &["pdf"], output_extensions: &["png", "jpg", "webp", "tiff"], required_engines: &["pdfium"], supports_batch: true, experimental: false },
    ToolDefinition { id: "pdf-to-pages", title: "PDF转Pages", accepted_extensions: &["pdf"], output_extensions: &["docx"], required_engines: &["pdfium", "office-writer"], supports_batch: true, experimental: true },
    ToolDefinition { id: "pdf-to-numbers", title: "PDF转Numbers", accepted_extensions: &["pdf"], output_extensions: &["xlsx"], required_engines: &["office-writer"], supports_batch: true, experimental: true },
    ToolDefinition { id: "pdf-to-keynote", title: "PDF转Keynote", accepted_extensions: &["pdf"], output_extensions: &["pptx"], required_engines: &["pdfium"], supports_batch: true, experimental: true },
    ToolDefinition { id: "pdf-to-epub", title: "PDF转EPUB", accepted_extensions: &["pdf"], output_extensions: &["epub"], required_engines: &["epub"], supports_batch: true, experimental: true },
    ToolDefinition { id: "word-to-pdf", title: "Word转换成PDF", accepted_extensions: &["doc", "docx", "rtf", "odt"], output_extensions: &["pdf"], required_engines: &["libreoffice"], supports_batch: true, experimental: false },
    ToolDefinition { id: "excel-to-pdf", title: "Excel转换成PDF", accepted_extensions: &["xls", "xlsx", "csv", "ods"], output_extensions: &["pdf"], required_engines: &["libreoffice"], supports_batch: true, experimental: false },
    ToolDefinition { id: "pptx-to-pdf", title: "PPTX转换成PDF", accepted_extensions: &["ppt", "pptx", "odp"], output_extensions: &["pdf"], required_engines: &["libreoffice"], supports_batch: true, experimental: false },
    ToolDefinition { id: "images-to-pdf", title: "图片转换成PDF", accepted_extensions: &["jpg", "jpeg", "png", "bmp", "gif", "tiff", "webp"], output_extensions: &["pdf"], required_engines: &["image"], supports_batch: true, experimental: false },
    ToolDefinition { id: "extract-pdf-images", title: "提取PDF图像", accepted_extensions: &["pdf"], output_extensions: &["png", "jpg"], required_engines: &["pdfcpu"], supports_batch: true, experimental: false },
    ToolDefinition { id: "encrypt-pdf", title: "加密PDF", accepted_extensions: &["pdf"], output_extensions: &["pdf"], required_engines: &["qpdf"], supports_batch: true, experimental: false },
    ToolDefinition { id: "decrypt-pdf", title: "解锁PDF", accepted_extensions: &["pdf"], output_extensions: &["pdf"], required_engines: &["qpdf"], supports_batch: true, experimental: false },
    ToolDefinition { id: "reorder-pdf", title: "重新排列页面", accepted_extensions: &["pdf"], output_extensions: &["pdf"], required_engines: &["qpdf", "pdfium"], supports_batch: false, experimental: false },
    ToolDefinition { id: "merge-pdf", title: "合并PDF", accepted_extensions: &["pdf"], output_extensions: &["pdf"], required_engines: &["qpdf"], supports_batch: false, experimental: false },
    ToolDefinition { id: "split-pdf", title: "拆分PDF", accepted_extensions: &["pdf"], output_extensions: &["pdf"], required_engines: &["qpdf"], supports_batch: true, experimental: false },
    ToolDefinition { id: "delete-pdf-pages", title: "删除PDF页面", accepted_extensions: &["pdf"], output_extensions: &["pdf"], required_engines: &["qpdf", "pdfium"], supports_batch: true, experimental: false },
    ToolDefinition { id: "watermark-pdf", title: "添加水印到PDF", accepted_extensions: &["pdf"], output_extensions: &["pdf"], required_engines: &["pdfcpu"], supports_batch: true, experimental: false },
    ToolDefinition { id: "rotate-pdf", title: "旋转PDF", accepted_extensions: &["pdf"], output_extensions: &["pdf"], required_engines: &["qpdf"], supports_batch: true, experimental: false },
    ToolDefinition { id: "image-format-convert", title: "图片格式转换", accepted_extensions: &["jpg", "jpeg", "png", "webp", "bmp", "tiff"], output_extensions: &["jpg", "png", "webp", "bmp", "tiff"], required_engines: &["image"], supports_batch: true, experimental: false },
    ToolDefinition { id: "pdf-page-numbers", title: "PDF页码", accepted_extensions: &["pdf"], output_extensions: &["pdf"], required_engines: &["pdfcpu"], supports_batch: true, experimental: false },
    ToolDefinition { id: "compress-pdf", title: "压缩PDF", accepted_extensions: &["pdf"], output_extensions: &["pdf"], required_engines: &["pdfcpu", "qpdf"], supports_batch: true, experimental: false },
];

pub fn get_tool(id: &str) -> Option<&'static ToolDefinition> {
    TOOLS.iter().find(|tool| tool.id == id)
}
