# NOVA Testing Strategy & Verification Plan

**Document ID:** NOVA-TEST-001  
**Scope:** Automated & Manual Verification Matrix across Windows 10 & 11  

---

## 1. Unit & Subsystem Testing

### 1.1 Frontend React Tier
- **Theme Engine:** Verify CSS custom property injection and data-theme switching between `minimal`, `rgb`, `light`, and `vivid`.
- **Island State Transitions:** Verify that `isExpanded` toggles on hover after `hoverDelayMs` and collapses on mouse exit after `collapseDelayMs`.
- **Interaction Lock:** Verify that while `isInteracting = true` (e.g. focused text field or active timer/drop session), mouse leave events are ignored and do not collapse the interface.
- **Escape Key Handling:** Verify that pressing `Escape` collapses the expanded workspace to the resting capsule.

### 1.2 Native Rust Backend Tier
- **Database Migrations:** Ensure SQLite tables (`app_settings`, `module_registry`, `clipboard_items`, `notes`, `shelves`, etc.) are created idempotent on startup.
- **System Telemetry:** Verify `sysinfo` queries for CPU, RAM, Disk, and Network I/O return valid non-null numerical data without throwing panics or blocking threads.
- **Window Management:** Confirm `LogicalPosition` coordinates calculate correctly for single and multi-monitor setups at 100%, 125%, 150%, and 200% DPI.

---

## 2. Windows Desktop Verification Matrix

| Test Case | Scenario / Expected Behavior | Verification Target | Status |
| :--- | :--- | :--- | :--- |
| **TC-01** | **Window Launch & Top Center** | App launches, positions at screen top center without standard window borders. | Tested |
| **TC-02** | **Hover Expand / Collapse** | Hovering for 120ms expands pill into workspace. Moving cursor away collapses after 320ms. | Tested |
| **TC-03** | **Input Focus Lock** | Typing into search field or note prevents accidental collapse when mouse leaves. | Tested |
| **TC-04** | **System Telemetry** | CPU, RAM, and Disk metrics match Windows Task Manager. | Tested |
| **TC-05** | **Offline Operation** | Core tools (Timers, Notes, Units, Clipboard) function 100% offline. | Tested |
| **TC-06** | **Transparent Hit-Testing** | Clicks outside the visible pill/card pass through to underlying desktop windows. | Tested |
