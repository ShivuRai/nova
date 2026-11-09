# NOVA Modules Specification (23 Modules)

**Document ID:** NOVA-MOD-001  
**Architecture:** Decoupled Micro-Modules with Unified Registry  

---

## Complete Module Registry Index

### Group 1: Everyday Essentials
1. **MOD-01: Clipboard Manager (`clipboard`)**
   - Automatically monitors supported clipboard formats (text, image links, file lists).
   - Local SQLite search with pinning, category tags, and regex exclusion for password managers.
2. **MOD-02: Quick Notes (`notes`)**
   - Scratchpad notes with markdown rendering, real-time checklist items, and JSON export.
3. **MOD-03: Saved Links (`links`)**
   - One-click access to essential bookmarks, auto-fetched favicons, categorized links.
4. **MOD-04: Weather & Forecast (`weather`)**
   - Open-Meteo REST API with offline cache: current temperature, feels-like, UV index, 7-day forecast.
5. **MOD-05: Units & Currency (`units`)**
   - Instant conversions across length, weight, area, temperature, data bytes, and foreign exchange rates.

### Group 2: Productivity & Files
6. **MOD-06: NOVA Drop (`drop`)**
   - Zero-cloud, local-network file transfer between phone and PC via ephemeral QR code pairing and streaming HTTP.
7. **MOD-07: File Shelf (`shelf`)**
   - Visual drag-and-drop parking lot to hold files temporarily while switching applications or projects.
8. **MOD-08: File Converter (`converter`)**
   - Batch image format conversion (PNG, JPG, WebP, BMP, ICO, PDF) with quality sliders and aspect-ratio locks.
9. **MOD-09: Quick File Tools (`file-tools`)**
   - Cryptographic hash generator (SHA-256, SHA-1, MD5), bulk string rename, file metadata inspection.

### Group 3: Time & Focus
10. **MOD-10: Timers & Focus (`timers`)**
    - Pomodoro cycles (25/5/15), custom countdown timers, precise stopwatch with lap splits.
11. **MOD-11: Calendar & Agenda (`calendar`)**
    - Interactive month/week views, local event manager, ICS file import.
12. **MOD-12: World Clock (`clock`)**
    - Simultaneous multi-timezone display with day/night relative sun indicators.
13. **MOD-13: Screen Time (`screen-time`)**
    - Privacy-first foreground window usage monitoring with zero content logging.

### Group 4: Desktop & System
14. **MOD-14: Home Dashboard (`home`)**
    - Configurable grid featuring active widgets, system glances, now-playing media, and quick action buttons.
15. **MOD-15: System Monitor (`system`)**
    - Real-time CPU, RAM, Disk I/O, Network upload/download rates, battery health, and GPU status.
16. **MOD-16: Custom Message (`message`)**
    - Custom marquee ticker text or motivational reminders displayed inside the collapsed notch pill.
17. **MOD-17: Quick Launcher (`launcher`)**
    - Spotlight/Alfred style instant search for apps, files, URLs, and custom commands.
18. **MOD-18: Quick Settings (`quick-settings`)**
    - Native volume slider, display brightness, night-light shortcut, Wi-Fi/Bluetooth quick toggles.

### Group 5: Specialist & Aesthetics
19. **MOD-19: AI Coding Monitor (`ai-coding`)**
    - Parses local Claude Code & LLM session logs, calculating token consumption and estimated daily/weekly cost.
20. **MOD-20: Website Analytics (`analytics`)**
    - Read-only real-time visitor stats from Plausible and DataFast APIs.
21. **MOD-21: Revenue Dashboard (`revenue`)**
    - Read-only sales and revenue summaries from Stripe and Gumroad APIs.
22. **MOD-22: Desktop Pet (`pet`)**
    - Optional desktop mascot that reacts to music beats, battery alerts, and system focus.
23. **MOD-23: RGB Engine (`rgb`)**
    - Dynamic RGB border gradients, breathing pulses, and music-reactive audio visualizer styling.
