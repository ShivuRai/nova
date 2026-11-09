use rusqlite::{params, Connection, Result};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub fn init() -> Result<Self> {
        let db_path = get_database_path();
        if let Some(parent) = db_path.parent() {
            let _ = fs::create_dir_all(parent);
        }

        let conn = Connection::open(&db_path)?;
        let db = Database {
            conn: Mutex::new(conn),
        };
        db.run_migrations()?;
        Ok(db)
    }

    fn run_migrations(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();

        // 1. Settings
        conn.execute(
            "CREATE TABLE IF NOT EXISTS app_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at INTEGER NOT NULL
            );",
            [],
        )?;

        // 2. Module Registry
        conn.execute(
            "CREATE TABLE IF NOT EXISTS module_registry (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                enabled INTEGER NOT NULL DEFAULT 1,
                settings_json TEXT DEFAULT '{}',
                updated_at INTEGER NOT NULL
            );",
            [],
        )?;

        // 3. Clipboard items
        conn.execute(
            "CREATE TABLE IF NOT EXISTS clipboard_items (
                id TEXT PRIMARY KEY,
                content_type TEXT NOT NULL,
                text_content TEXT,
                preview_url TEXT,
                source_app TEXT,
                char_count INTEGER,
                is_pinned INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL
            );",
            [],
        )?;

        // 4. Notes
        conn.execute(
            "CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                color TEXT DEFAULT '#141720',
                is_pinned INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );",
            [],
        )?;

        // 5. Checklists
        conn.execute(
            "CREATE TABLE IF NOT EXISTS note_checklist_items (
                id TEXT PRIMARY KEY,
                note_id TEXT NOT NULL,
                item_text TEXT NOT NULL,
                is_completed INTEGER NOT NULL DEFAULT 0,
                sort_order INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE
            );",
            [],
        )?;

        // 6. Shelves
        conn.execute(
            "CREATE TABLE IF NOT EXISTS shelves (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL
            );",
            [],
        )?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS shelf_items (
                id TEXT PRIMARY KEY,
                shelf_id TEXT NOT NULL,
                original_path TEXT NOT NULL,
                managed_path TEXT NOT NULL,
                file_name TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                mime_type TEXT,
                created_at INTEGER NOT NULL,
                FOREIGN KEY(shelf_id) REFERENCES shelves(id) ON DELETE CASCADE
            );",
            [],
        )?;

        // 7. Focus sessions
        conn.execute(
            "CREATE TABLE IF NOT EXISTS focus_sessions (
                id TEXT PRIMARY KEY,
                session_type TEXT NOT NULL,
                duration_seconds INTEGER NOT NULL,
                completed_at INTEGER NOT NULL
            );",
            [],
        )?;

        // 8. Saved links
        conn.execute(
            "CREATE TABLE IF NOT EXISTS saved_links (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                url TEXT NOT NULL,
                category TEXT DEFAULT 'General',
                is_favorite INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL
            );",
            [],
        )?;

        // 9. Transfer history
        conn.execute(
            "CREATE TABLE IF NOT EXISTS transfer_history (
                id TEXT PRIMARY KEY,
                device_name TEXT NOT NULL,
                direction TEXT NOT NULL,
                file_name TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                transferred_at INTEGER NOT NULL,
                status TEXT NOT NULL
            );",
            [],
        )?;

        Ok(())
    }

    pub fn set_setting(&self, key: &str, value: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        let now = chrono_now();
        conn.execute(
            "INSERT INTO app_settings (key, value, updated_at) VALUES (?1, ?2, ?3)
             ON CONFLICT(key) DO UPDATE SET value = ?2, updated_at = ?3;",
            params![key, value, now],
        )?;
        Ok(())
    }

    pub fn get_setting(&self, key: &str) -> Result<Option<String>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT value FROM app_settings WHERE key = ?1")?;
        let mut rows = stmt.query(params![key])?;
        if let Some(row) = rows.next()? {
            let val: String = row.get(0)?;
            Ok(Some(val))
        } else {
            Ok(None)
        }
    }
}

fn chrono_now() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}

fn get_database_path() -> PathBuf {
    if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
        PathBuf::from(local_app_data).join("NOVA").join("database").join("nova.db")
    } else {
        PathBuf::from("./data/database/nova.db")
    }
}
