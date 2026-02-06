use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum FriedmanError {
    #[error("Sidecar execution failed: {0}")]
    SidecarExec(String),
    #[error("Sidecar returned non-zero exit: {stderr}")]
    SidecarExit { code: i32, stderr: String },
    #[error("Failed to parse JSON output: {0}")]
    JsonParse(String),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Invalid parameters: {0}")]
    InvalidParams(String),
}

// Tauri commands require Serialize on errors
impl Serialize for FriedmanError {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(&self.to_string())
    }
}
