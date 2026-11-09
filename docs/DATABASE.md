# NOVA Database Architecture & Schema Specification

**Document ID:** NOVA-DB-001  
**Engine:** SQLite 3 (Bundled via `rusqlite`)  
**Storage Paths:**
- Installed Mode: `%LOCALAPPDATA%\NOVA\database\nova.db`
- Portable Mode: `./data/database/nova.db`

---

## 1. Relational Schema & Tables

### 1.1 `app_settings`
Stores global key-value configuration.
```sql
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);
```

### 1.2 `module_registry`
Tracks dynamic registration and enablement state of modules.
```sql
CREATE TABLE IF NOT EXISTS module_registry (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1,
    settings_json TEXT DEFAULT '{}',
    updated_at INTEGER NOT NULL
);
```

### 1.3 `clipboard_items` & `clipboard_pins`
Local clipboard history with full-text search capability.
```sql
CREATE TABLE IF NOT EXISTS clipboard_items (
    id TEXT PRIMARY KEY,
    content_type TEXT NOT NULL, -- 'text', 'image', 'file'
    text_content TEXT,
    preview_url TEXT,
    source_app TEXT,
    char_count INTEGER,
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS clipboard_pins (
    item_id TEXT PRIMARY KEY,
    pinned_at INTEGER NOT NULL,
    FOREIGN KEY(item_id) REFERENCES clipboard_items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_clipboard_created ON clipboard_items(created_at DESC);
```

### 1.4 `notes` & `note_checklist_items`
Auto-saved local notes with checklist support.
```sql
CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    color TEXT DEFAULT '#141720',
    is_pinned INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS note_checklist_items (
    id TEXT PRIMARY KEY,
    note_id TEXT NOT NULL,
    item_text TEXT NOT NULL,
    is_completed INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE
);
```

### 1.5 `shelves` & `shelf_items`
File shelf parking lot records.
```sql
CREATE TABLE IF NOT EXISTS shelves (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS shelf_items (
    id TEXT PRIMARY KEY,
    shelf_id TEXT NOT NULL,
    original_path TEXT NOT NULL,
    managed_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(shelf_id) REFERENCES shelves(id) ON DELETE CASCADE
);
```

### 1.6 `timers` & `focus_sessions`
Monotonic timer logs and Pomodoro records.
```sql
CREATE TABLE IF NOT EXISTS focus_sessions (
    id TEXT PRIMARY KEY,
    session_type TEXT NOT NULL, -- 'work', 'short_break', 'long_break'
    duration_seconds INTEGER NOT NULL,
    completed_at INTEGER NOT NULL
);
```

### 1.7 `saved_links`
Quick-access URL bookmarks.
```sql
CREATE TABLE IF NOT EXISTS saved_links (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    is_favorite INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
);
```

### 1.8 `transfer_history`
NOVA Drop local transfers log.
```sql
CREATE TABLE IF NOT EXISTS transfer_history (
    id TEXT PRIMARY KEY,
    device_name TEXT NOT NULL,
    direction TEXT NOT NULL, -- 'inbound', 'outbound'
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    transferred_at INTEGER NOT NULL,
    status TEXT NOT NULL -- 'completed', 'failed', 'cancelled'
);
```
