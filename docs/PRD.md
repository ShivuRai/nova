# NOVA Product Requirements Document (PRD)

**Product Name:** NOVA  
**Tagline:** Your desktop. Reimagined.  
**Classification:** Free, Open-Source Windows Desktop Productivity & System Utility  
**Supported Platforms:** Windows 10 (Build 17763.0+) and Windows 11 (64-bit)  
**Distribution:** Windows Installer (.msi / NSIS .exe) + Portable ZIP + GitHub Source  
**Version:** 1.0.0-alpha  

---

## 1. Product Objectives & Core Principles

NOVA is a modular, local-first Windows desktop companion anchored at the top-centre of the desktop. It merges a sleek "Dynamic Island" floating interaction model with an extensible productivity suite, native system telemetry, and offline-first micro-tools.

### Core Principles
1. **100% Free & Open Source:** No subscription, no feature paywalls, no trial expirations.
2. **Local-First & Offline-Resilient:** Personal data, clipboard history, notes, and metrics remain strictly on the user's PC.
3. **Zero Intrusive Popups / Telemetry:** No mandatory account creation, zero user tracking, zero ad injection.
4. **Performance Obsessed:** Idle CPU < 1%, idle RAM < 150 MB, instantaneous UI transitions (<250ms).
5. **No Fabricated Data:** Real hardware telemetry and true connection statuses only.

---

## 2. Core User Personas

1. **Power Users & Developers:** Needing instant access to clipboard history, file conversions, hash utilities, system loads, and local AI token spending.
2. **Creatives & Multitaskers:** Dragging files to a persistent shelf, converting images on the fly, controlling music playback without app switching.
3. **Gamers & Enthusiasts:** Appreciating customizable dynamic RGB edge-lighting, system temperature/usage glance, and auto-hiding during full-screen games.
4. **Privacy-Conscious Individuals:** Wanting local phone-to-PC file transfer (NOVA Drop) without uploading sensitive documents to cloud services.

---

## 3. Structural Capabilities & Functional Requirements

### 3.1 The Floating Island (The Anchor)
- **Top-Center Geometry:** Pinned to top-center of primary (or chosen) monitor.
- **Collapsed Pill State:** Height: 28–36px, Width: 160–220px. Rounded capsule with subtle translucent backdrop and optional breathing border glow.
- **Expansion Physics:** Dynamic spring morphing upon hover (120ms delay) or hotkey (`Alt+Space` or `Ctrl+Shift+Space`) expanding into a 580–720px wide by 340–480px high workspace.
- **Interaction Guard:** Bar remains open if user is typing into an input, dragging a file, or actively navigating a module.
- **Multi-State Live Activities:** Auto-adapts to show now-playing audio, active timers, file transfer progress, or critical battery alerts.

### 3.2 Product Modules (23 Micro-Tools)
1. **Clipboard Manager:** Capture text/images/files, instant search, pin favorites, regex exclude.
2. **Quick Notes & Checklists:** Auto-saving markdown notes, tasks, local search.
3. **Saved Links:** Categories, favicons, one-click browser launch.
4. **Weather & Forecast:** Offline-resilient Open-Meteo weather, hourly forecasts, UV, wind.
5. **Units & Currency:** Comprehensive offline unit conversion with cached exchange rates.
6. **NOVA Drop:** Local Wi-Fi HTTP transfer with QR code pairing and PIN authentication.
7. **File Shelf:** Multi-category drag-and-drop parking lot for files.
8. **File Converter:** Batch image format conversion (PNG, JPG, WebP, BMP, ICO, PDF) with quality/size controls.
9. **Quick File Tools:** SHA-256/MD5 hash calculator, bulk renaming, metadata inspection.
10. **Timers & Focus:** Pomodoro sessions, countdowns, stopwatches, sound chimes.
11. **Calendar & Agenda:** Month/week views, upcoming reminders, ICS import.
12. **World Clock:** Dual/multiple timezone clocks with day/night visualization.
13. **Screen Time:** Local foreground application duration logging without content inspection.
14. **Home Dashboard:** Modular widget grid with customizable cards.
15. **System Monitor:** Real-time CPU, RAM, Disk, Network I/O, and battery telemetry.
16. **Custom Message:** Configurable ticker text and announcements in the notch pill.
17. **Quick Launcher:** File, app, and web shortcut search with arrow-key navigation.
18. **Quick Settings:** Volume slider, display brightness, night light, and Windows shortcuts.
19. **AI Coding Monitor:** Local Claude Code / LLM token spend logs and cost estimation.
20. **Website Analytics:** Privacy-respecting Plausible / DataFast reader.
21. **Revenue Dashboard:** Read-only Stripe / Gumroad revenue metrics.
22. **Desktop Pet:** Optional, lightweight animated companion responding to system states.
23. **RGB Engine:** Dynamic gradients, breathing cycles, and music-reactive borders.

---

## 4. Success Criteria

- Clean compilation on Windows 10/11 using Tauri 2 and MSVC.
- Zero flicker during window resize/expansion.
- Non-blocking hit-testing: transparent areas pass through mouse events to underlying windows.
- SQLite database initializes reliably with zero configuration.
- Packaged as both an installer (.exe) and a standalone portable zip.
