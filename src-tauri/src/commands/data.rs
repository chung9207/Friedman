use std::fs;
use std::io::BufRead;

use tauri::{AppHandle, Manager};

use crate::error::FriedmanError;
use crate::sidecar::run_friedman_command;
use crate::state::{AppState, DatasetInfo};

/// Load a CSV file: read header for column names, count rows, store in state.
#[tauri::command]
pub async fn load_csv(
    app: AppHandle,
    path: String,
) -> Result<DatasetInfo, FriedmanError> {
    let file = fs::File::open(&path)?;
    let reader = std::io::BufReader::new(file);

    let mut lines = reader.lines();

    // First line is the header
    let header_line = lines
        .next()
        .ok_or_else(|| FriedmanError::InvalidParams("CSV file is empty".into()))?
        .map_err(|e| FriedmanError::Io(e))?;

    let columns: Vec<String> = header_line
        .split(',')
        .map(|s| s.trim().trim_matches('"').to_string())
        .collect();

    // Count remaining lines (data rows)
    let mut row_count: usize = 0;
    for line in lines {
        let _ = line?;
        row_count += 1;
    }

    let id = uuid::Uuid::new_v4().to_string();
    let name = std::path::Path::new(&path)
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| "unknown".into());

    let info = DatasetInfo {
        id: id.clone(),
        name,
        path: path.clone(),
        columns,
        row_count,
    };

    let state = app.state::<AppState>();
    state
        .datasets
        .lock()
        .expect("datasets lock poisoned")
        .insert(id, info.clone());

    Ok(info)
}

/// Load an XLSX file via the sidecar `data import` subcommand, store in state.
#[tauri::command]
pub async fn load_xlsx(
    app: AppHandle,
    path: String,
) -> Result<DatasetInfo, FriedmanError> {
    let result = run_friedman_command(
        &app,
        vec!["data", "import", "--path", &path],
    )
    .await?;

    let columns: Vec<String> = result
        .get("columns")
        .and_then(|v| v.as_array())
        .map(|arr| {
            arr.iter()
                .filter_map(|v| v.as_str().map(String::from))
                .collect()
        })
        .unwrap_or_default();

    let row_count = result
        .get("row_count")
        .and_then(|v| v.as_u64())
        .unwrap_or(0) as usize;

    let id = uuid::Uuid::new_v4().to_string();
    let name = std::path::Path::new(&path)
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| "unknown".into());

    let info = DatasetInfo {
        id: id.clone(),
        name,
        path: path.clone(),
        columns,
        row_count,
    };

    let state = app.state::<AppState>();
    state
        .datasets
        .lock()
        .expect("datasets lock poisoned")
        .insert(id, info.clone());

    Ok(info)
}

/// Retrieve a previously loaded dataset by its ID.
#[tauri::command]
pub async fn get_dataset(
    app: AppHandle,
    id: String,
) -> Result<DatasetInfo, FriedmanError> {
    let state = app.state::<AppState>();
    let datasets = state.datasets.lock().expect("datasets lock poisoned");
    datasets
        .get(&id)
        .cloned()
        .ok_or_else(|| FriedmanError::InvalidParams(format!("Dataset not found: {id}")))
}

/// List all loaded datasets.
#[tauri::command]
pub async fn list_datasets(
    app: AppHandle,
) -> Result<Vec<DatasetInfo>, FriedmanError> {
    let state = app.state::<AppState>();
    let datasets = state.datasets.lock().expect("datasets lock poisoned");
    Ok(datasets.values().cloned().collect())
}

/// Preview the first N rows of a data file via the sidecar.
#[tauri::command]
pub async fn preview_data(
    app: AppHandle,
    path: String,
    rows: Option<usize>,
) -> Result<serde_json::Value, FriedmanError> {
    let rows_str = rows.unwrap_or(100).to_string();
    run_friedman_command(
        &app,
        vec!["data", "preview", "--path", &path, "--rows", &rows_str],
    )
    .await
}
