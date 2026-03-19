use serde::Serialize;
use std::fmt;

/// Structured error type for Tauri commands.
///
/// Serialized as `{"kind": "Database", "message": "..."}` so the frontend
/// can branch on `kind` while still showing a human-readable `message`.
#[derive(Debug, Serialize)]
pub struct AppError {
    pub kind: ErrorKind,
    pub message: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum ErrorKind {
    Database,
    Io,
    Network,
    Git,
    NotFound,
    InvalidInput,
    Cancelled,
    Internal,
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl AppError {
    pub fn not_found(msg: impl Into<String>) -> Self {
        Self { kind: ErrorKind::NotFound, message: msg.into() }
    }

    pub fn invalid_input(msg: impl Into<String>) -> Self {
        Self { kind: ErrorKind::InvalidInput, message: msg.into() }
    }

    pub fn cancelled(msg: impl Into<String>) -> Self {
        Self { kind: ErrorKind::Cancelled, message: msg.into() }
    }

    /// Convert an `anyhow::Error` originating from database operations.
    pub fn db(e: impl fmt::Display) -> Self {
        Self { kind: ErrorKind::Database, message: e.to_string() }
    }

    /// Convert an `anyhow::Error` originating from git operations.
    pub fn git(e: impl fmt::Display) -> Self {
        Self { kind: ErrorKind::Git, message: e.to_string() }
    }

    /// Convert a git operation error, detecting cancellation from the message.
    pub fn git_or_cancelled(e: impl fmt::Display) -> Self {
        let message = e.to_string();
        let lower = message.to_ascii_lowercase();
        if lower.contains("cancelled") || lower.contains("canceled") {
            Self { kind: ErrorKind::Cancelled, message }
        } else {
            Self { kind: ErrorKind::Git, message }
        }
    }

    /// Convert an `anyhow::Error` originating from network operations.
    pub fn network(e: impl fmt::Display) -> Self {
        Self { kind: ErrorKind::Network, message: e.to_string() }
    }

    /// Convert an `anyhow::Error` originating from IO operations.
    pub fn io(e: impl fmt::Display) -> Self {
        Self { kind: ErrorKind::Io, message: e.to_string() }
    }

    pub fn internal(e: impl fmt::Display) -> Self {
        Self { kind: ErrorKind::Internal, message: e.to_string() }
    }
}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        Self { kind: ErrorKind::Io, message: e.to_string() }
    }
}

impl From<tokio::task::JoinError> for AppError {
    fn from(e: tokio::task::JoinError) -> Self {
        Self { kind: ErrorKind::Internal, message: e.to_string() }
    }
}

impl From<tauri::Error> for AppError {
    fn from(e: tauri::Error) -> Self {
        Self { kind: ErrorKind::Internal, message: e.to_string() }
    }
}
