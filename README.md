# NOVA — Your desktop. Reimagined.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%2010%20%7C%2011-0078D6.svg)
![Architecture](https://img.shields.io/badge/architecture-Tauri%202%20%2B%20React%20%2B%20Rust-6688FF.svg)

**NOVA** is a free, modular, local-first Windows desktop companion anchored at the top-centre of your screen. Inspired by the Dynamic Island concept, NOVA transforms dead screen bezel space into an intelligent, interactive workspace housing 23 essential micro-tools.

---

## 🌟 Key Highlights

- **Dynamic Island Interaction:** Pinned at top-center. Rests as a subtle, unobtrusive capsule; smoothly springs into a rich, compact control centre upon hover or keyboard shortcut.
- **Interaction-Aware:** Stays open while you are typing notes, searching apps, or transferring files—no accidental collapsing.
- **100% Free & Open-Source:** No subscriptions, no ads, no telemetry, no mandatory cloud accounts.
- **Local-First & Offline:** Persistent SQLite database keeping your clipboard history, notes, and preferences strictly on your PC.
- **Hardware Telemetry:** Real-time CPU, RAM, Disk, and Network I/O metrics powered by native Windows APIs.
- **NOVA Drop:** Wireless, QR-paired phone-to-PC file transfer over local Wi-Fi without cloud intermediaries.
- **Aesthetic Modes:** Switch effortlessly between **Premium Minimal**, **Gaming RGB**, **Light**, and **Vivid** themes.

---

## 🛠️ Architecture

```
Frontend:  React 19, TypeScript, Vite, Framer Motion, Zustand, Lucide Icons
Backend:   Tauri 2, Rust, SQLite (rusqlite), sysinfo, Windows APIs
Storage:   Local-first SQLite (%LOCALAPPDATA%\NOVA\database\nova.db)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ (Node v24 tested)
- Rust 1.80+ (MSVC toolchain)
- Windows 10/11 (64-bit)

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/nova-desktop/nova.git
cd nova

# Install frontend dependencies
npm install

# Build frontend and launch Tauri desktop companion
npm run tauri dev
```

---

## 📂 Documentation

- [Reference Research & Competitive Analysis](docs/REFERENCE_RESEARCH.md)
- [Product Requirements Document (PRD)](docs/PRD.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Database Schema & Migrations](docs/DATABASE.md)
- [Design System & Theme Tokens](docs/DESIGN_SYSTEM.md)
- [Module Registry & Extensibility](docs/MODULES.md)
- [Testing Matrix](docs/TESTING.md)
- [Release Guide](docs/RELEASE.md)
- [Implementation Progress](docs/IMPLEMENTATION_STATUS.md)

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
