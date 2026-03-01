use std::process::Command;
use std::sync::Arc;
use tauri::State;

use crate::core::{central_repo, skill_store::SkillStore};

#[tauri::command]
pub fn get_settings(key: String, store: State<'_, Arc<SkillStore>>) -> Result<Option<String>, String> {
    store.get_setting(&key).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_settings(
    key: String,
    value: String,
    store: State<'_, Arc<SkillStore>>,
) -> Result<(), String> {
    store.set_setting(&key, &value).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn open_central_repo_in_finder() -> Result<(), String> {
    let repo_path = central_repo::base_dir();
    let status = Command::new("open")
        .arg(&repo_path)
        .status()
        .map_err(|e| format!("Failed to launch Finder: {e}"))?;

    if status.success() {
        Ok(())
    } else {
        Err(format!("Finder exited with status: {status}"))
    }
}
