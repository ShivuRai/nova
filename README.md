# NOVA — Your Desktop. Reimagined.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%2010%20%7C%2011-0078D6.svg)
![Tech Stack](https://img.shields.io/badge/stack-Electron%20%7C%20React%2019%20%7C%20TypeScript%20%7C%20Vite-6688FF.svg)

**NOVA** is a modular, high-performance, local-first Windows desktop companion anchored at the top-centre of your screen. Inspired by the Dynamic Island concept, NOVA transforms dead screen bezel space into an intelligent, interactive workspace housing 24 tools, real-time telemetry, companion mascots, and customizable geometric notch contours.

---

## 🌟 Key Highlights

- **Dynamic Island Architecture:** Pinned seamlessly at your display bezel. Rests as a sleek, unobtrusive pill; springs into a rich, glassmorphic command centre upon hover or global hotkey.
- **Custom Notch Shape Studio:** Build your own personalized notch contours with live chamfer bevels (0–28px), aerodynamic wing cutouts (0–24px), and corner radius sliders.
- **SVG Geometric Edge Lighting Engine:** Animated neon border traces that dynamically calculate exact polynomial perimeter coordinates to hug every 45° chamfer, aero wing, and curve with 100% sub-pixel accuracy.
- **12 Flagship Notch Profiles:** Floating Pill, Dynamic Wing, Chamfered Notch, Stealth Blade, Cyber Diamond, Split Capsule Twin-Pod, Teardrop, Hex HUD Pill, Liquid Droplet, Squircle Bar, Compact Badge, and Custom Studio.
- **60 FPS Seasonal Canvas Particle Engine:** Organic physics simulation supporting Falling Snow crystals, Tumbling 3D Sakura petals, Shimmering Cosmic Stardust, Iridescent Soap Bubbles, Falling Matrix Phosphor Code, Warm Golden Fireflies, and Campfire Embers.
- **Interactive Companion Mascot Pet:** 10 animated desk companions (Astro Robot, Mochi Cat, Kitsune Fox, Draco Dragon, Bao Panda, Pippin Penguin, Spooky Ghost, Hoot Owl, Quantum Core, Pixel Byte) with Level & XP progression, petting audio feedback, snack feeding, and mini-games.
- **Audio-Reactive Equalizer & Media Detection:** Synchronized in real-time with Windows System Media Transport Controls (SMTC) to display active YouTube, Chrome, and Spotify playback.
- **Hardware Telemetry:** Real-time CPU, RAM, and network transfer meters right on the collapsed pill.
- **NOVA Drop:** Wireless, QR-paired phone-to-PC file transfer over local Wi-Fi without cloud intermediaries.
- **Local Desktop Tools:** Notes, timers, and clipboard work offline. Weather and website checks use the network.

---

## 🛠️ Architecture

```
Frontend:   React 19, TypeScript, Vite, Framer Motion, Zustand, Lucide Icons, Canvas 2D
Desktop:    Electron / Tauri 2, Node.js, C# Native Launcher (.NET Framework 4.8)
Audio:      Web Audio API Procedural Synthesizer (Glass, Cyber, Mechanical, 8-Bit)
Security:   Isolated Electron renderer, limited desktop bridge
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 24 LTS
- Windows 10 or 11 (64-bit)

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/ShivuRai/nova.git
cd nova

# Install dependencies
npm install

# Build frontend assets
npm run build

# Launch the desktop companion
npm start
```

Run `npm run build:desktop` to prepare or refresh the portable version. Launch `NOVA.bat` or `dist-app\NOVA.exe`. Alt + Space opens the command bar. Alt + Shift + Space expands or collapses the island.

---

## 📂 Documentation

- [Product Requirements Document (PRD)](docs/PRD.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Security, Code Signing & Verification](SECURITY_AND_VERIFICATION.md)
- [Design System & Theme Tokens](docs/DESIGN_SYSTEM.md)
- [Module Registry & Extensibility](docs/MODULES.md)
- [Testing Matrix](docs/TESTING.md)
- [Release Guide](docs/RELEASE.md)
- [Implementation Progress](docs/IMPLEMENTATION_STATUS.md)
- [Project Audit and Priorities](docs/AUDIT.md)

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
