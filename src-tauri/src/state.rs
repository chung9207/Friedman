use std::collections::HashMap;
use std::sync::Mutex;

pub struct AppState {
    /// Loaded datasets keyed by an ID
    pub datasets: Mutex<HashMap<String, DatasetInfo>>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct DatasetInfo {
    pub id: String,
    pub name: String,
    pub path: String,
    pub columns: Vec<String>,
    pub row_count: usize,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            datasets: Mutex::new(HashMap::new()),
        }
    }
}
