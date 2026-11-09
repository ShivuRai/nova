# NOVA Reference Research & Competitive Analysis: Vayli (Modi Studio)

**Document ID:** NOVA-DOC-REF-001  
**Target Subject:** Vayli Desktop Companion (`https://vayli.in/`)  
**Publisher:** Modi Studio  
**Primary Platform:** Windows 10 (Build 17763.0+) and Windows 11 (64-bit)  
**Date of Analysis:** November 2026  
**Status:** Completed Analysis  

---

## 1. Executive Summary

Vayli (`vayli.in`) is a proprietary desktop utility designed for Windows 10 and 11 by Modi Studio that implements an Apple-inspired "Dynamic Island" or top-edge screen notch. It acts as an interactive persistent hub housing ~18 everyday micro-tools (clipboard history, file shelf, now-playing media controller, local network drop, timers, weather, notes, reminders, system stats, unit conversion).

While Vayli delivers a clean concept for transforming dead screen space into a functional island, it operates under a proprietary commercial model (3-day trial then ₹199 license), has fixed UI limitations, closed-source boundaries, lacks deep developer/creator integrations (such as AI coding usage monitors, web analytics, revenue trackers, or custom scripting), and lacks customizable aesthetics like Gaming RGB or custom reactive edge-lighting.

**NOVA** adopts the best conceptual strengths of the desktop dynamic island while building an entirely **open-source, 100% free, highly extensible, modular desktop companion** built with Tauri 2, React, TypeScript, Rust, and SQLite.

---

## 2. Discovered Features Breakdown

| Feature | Detailed Functionality | User Access Mode | Interaction & Visual Behavior | Status/Classification |
| :--- | :--- | :--- | :--- | :--- |
| **Top Notch / Island** | Anchored to top-center of primary screen; collapsed pill resting state; expands into card interface. | Cursor hover (configurable delay) or global shortcut. | Smooth height/width expansion downwards; rounded corners; dark translucent backdrop. | Verified (Public demo & Store notes) |
| **Searchable Clipboard** | Captures copied text, links, and screenshot bitmaps. Ignores known password managers (e.g. 1Password, Bitwarden). | Dropdown tab in notch; search input field. | Scrollable history list; direct drag-and-drop into target applications; copy & pin actions. | Verified |
| **File Shelf** | Temporary parking lot for files being moved between apps/folders; format conversion utilities. | Hover island, drag files onto shelf. | Visual thumbnails of parked files; action buttons for conversion or drag-out. | Verified |
| **Vayli Drop** | Local wireless transfer between mobile phone and Windows PC using QR pairing. | Open Drop panel; scan QR with phone camera. | Mobile web client connects via local IP/port HTTP session to upload/download files. | Verified |
| **Now-Playing Controls** | System audio/media widget tracking current player (Spotify, browser, etc.). | Automatically surfaces on active media playback or via widget tab. | Displays track title, artist, playback progress bar, play/pause/prev/next controls. | Verified |
| **Timers & Stopwatch** | Focus timer (Pomodoro), countdowns, and standard stopwatch with lap recording. | Island tab or widget card. | Circular or linear progress meter; audible completion chime and toast notification. | Verified |
| **Quick Notes & Tasks** | Lightweight scratchpad with checklists and persistent local notes. | Island tab. | Inline editable list; checkboxes; markdown-compatible plain text. | Verified |
| **Weather & Forecast** | Current temperature, weather condition icons, hourly/daily forecasts. | Island widget. | Location-based weather overview cards; Celsius/Fahrenheit toggle. | Inferred via Open-Meteo or similar API |
| **Calendar & Reminders** | Schedule glance, quick event viewer, reminder list. | Island widget. | Monthly/daily calendar view; upcoming agenda list. | Verified |
| **World Clock** | Dual or multiple timezone clocks for remote collaboration. | Island widget. | Analog/digital clocks with day/night relative indicators. | Verified |
| **Unit & Currency** | Length, weight, volume, data, and currency exchange rates. | Island widget. | Numeric input, dropdown currency selectors, quick copy. | Verified |
| **Screen Time** | Tracks foreground window duration; daily/weekly usage summaries. | Island widget / Settings panel. | Bar charts showing top active applications without capturing content. | Verified |

---

## 3. Interaction Mechanics & Floating Interface Behavior

1. **Resting State:** A dark horizontal pill (approximately 160–200px wide, 30–36px high) pinned to the top-center edge of the active display. Uses a low-contrast border and slight drop shadow.
2. **Hover Detection:** When the cursor moves into the notch's bounding box, an internal timer (100–150ms) starts. If the cursor remains within bounds, the island smoothly morphs into an expanded workspace (approx. 500–680px wide, 320–460px high).
3. **Collapse Prevention:** If the cursor exits the bounds, a collapse delay (e.g. 300–500ms) runs. If the user clicks into an input field (search box, note editor) or drags a file, collapse is locked until explicitly dismissed via Escape, backdrop click, or unfocus.
4. **Window Hit-Testing:** In Windows, transparent layered windows must not block mouse clicks in transparent areas. Vayli adjusts the window's interactive region or click-through behavior so that clicking outside the visible island reaches desktop applications underneath.

---

## 4. Settings Organization & Operating System Integrations

### Settings Organization
- **General:** Launch at Windows startup; display selection (primary or specific monitor); notch alignment and offset; hotkeys.
- **Interaction:** Hover delay, collapse delay, click-to-expand toggle, pin expanded mode.
- **Appearance:** Notch radius, width, height, theme (Dark / Light), opacity.
- **Modules / Tools:** Toggle individual tools (Clipboard, Drop, Music, Shelf, Timers, etc.) on or off.
- **Privacy & Storage:** Clipboard retention period, ignored applications list, clear data.

### Known / Inferred OS Integrations
- **Windows System Media Transport Controls (SMTC):** For fetching now-playing metadata and controlling playback.
- **Windows Clipboard APIs (`AddClipboardFormatListener` / OLE):** For real-time clipboard change detection.
- **Windows Hook / Polling for Active Window:** For Screen Time tracking (`GetForegroundWindow`, `GetWindowThreadProcessId`).
- **Layered / Transparent Window APIs (`WS_EX_LAYERED`, `DwmExtendFrameIntoClientArea`):** For top-edge bezel-free rendering.

---

## 5. What is Missing or Unclear in Reference Product

1. **Closed Source & Commercial Paywall:** Vayli enforces a 3-day trial and a ₹199 license fee. Users cannot audit the code, inspect how clipboard data is handled, or contribute extensions.
2. **Limited Customization for Enthusiasts:** No dynamic RGB lighting, custom gradient effects, or music-synced audio visualization borders.
3. **Absence of Developer / Creator Tools:** Modern power users spend significant time in developer environments. There is no AI token/cost monitor (Claude Code, OpenAI, local LLMs), no developer quick tools (hash calculator, regex test, JSON formatter), and no web analytics or revenue tracker.
4. **Rigid Layout:** Modules are organized into predetermined tabs rather than customizable, drag-and-drop widget layouts on a modular dashboard.

---

## 6. Feature Comparison Table

| Feature | Reference Product (Vayli) | NOVA | NOVA Improvement |
| :--- | :--- | :--- | :--- |
| **License & Cost** | Commercial (3-day trial, ₹199 license) | **100% Free & Open-Source (MIT)** | Completely transparent, no paywall, no ads, community-driven. |
| **Floating Bar** | Standard dark pill with fixed easing | **Dynamic Island with Modular States** | Multi-state morphing (Collapsed, Compact Media, Live Alert, Expanded Workspace), customizable notch styles, and spring physics. |
| **Themes & Aesthetics** | Dark / Light minimal | **Premium Minimal + Gaming RGB + Edge Light** | Reactive RGB glow, audio-reactive pulses, customizable theme tokens, high-DPI scaling. |
| **Clipboard History** | Local list, basic exclude | **Advanced SQLite Vault** | Rich previews (code syntax, images, hex colors, file lists), AES-encrypted sensitive storage option, tag-based filtering, regex exclusions. |
| **File Shelf & Tools** | Basic shelf + simple converter | **Multi-Shelf Park & Bulk File Engine** | Multi-shelf categories, batch image resizing/converting (WebP, PNG, JPG, ICO, PDF), file hash verification (SHA-256, MD5), duplicate detection. |
| **Wireless Transfer** | Vayli Drop (Local HTTP QR) | **NOVA Drop 2.0** | End-to-end PIN authenticated local transfer, chunked streaming, transfer speed telemetry, zero cloud reliance. |
| **System Monitoring** | Basic CPU/RAM/Battery text | **Real-Time Hardware Telemetry** | Adaptive polling, per-core CPU, RAM breakdown, disk I/O, network up/down rate charts, optional GPU metrics. |
| **Developer Tools** | None | **AI Coding Monitor & Dev Utilities** | Local Claude Code & LLM token tracking, estimated cost counter, hash tools, quick JSON/URL formatters. |
| **Business / Creator** | None | **Analytics & Revenue Dashboards** | Read-only Plausible/DataFast analytics, Stripe/Gumroad revenue summaries with secure credential storage. |
| **Desktop Mascot** | None | **Desktop Pet (Optional)** | Lightweight, non-intrusive interactive companion reacting to battery, music, and notifications. |
| **Event Architecture** | Monolithic tool coupling | **Decoupled Event Bus & Module Registry** | Modules dynamically register, request permissions, listen to typed events (`media.playback`, `transfer.progress`), and render contextual live activities. |

---

## 7. NOVA Architectural Strategy

Based on these research findings, NOVA's architecture is structured to deliver:
1. **Zero-Flicker Native Window Management:** A lightweight Tauri 2 / Rust native window configured with `always_on_top`, transparent background, and precision hit-testing to ensure smooth hover expansion without blocking background desktop clicks.
2. **Modular Registry:** A plugin-ready module architecture where each utility (Clipboard, Notes, Drop, RGB, AI Monitor) is self-contained with declared permissions and event subscriptions.
3. **Local-First SQLite Persistence:** High-performance local storage with structured schema migrations for fast searches (<100ms) and complete offline reliability.
