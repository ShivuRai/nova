# NOVA — Security, Authenticity & Verification Guide

This document provides formal verification, provenance, cryptographic checksums, and security details for **NOVA Desktop Companion** to guarantee that the executable is 100% authentic, safe, and transparent for Windows Defender and local security scanners.

---

## 🛡️ Executive Summary & Safety Guarantees

- **100% Free & Open-Source:** Distributed under the permissive MIT License. Full source code is inspectable directly in this workspace.
- **Local-First & Offline:** All data (clipboard history, quick notes, pinned links) is stored strictly on your local PC in SQLite (`%LOCALAPPDATA%\NOVA\database\nova.db`).
- **Zero Telemetry / Zero Ads:** No background telemetry, no remote diagnostic transmission, no network snooping, no advertising trackers.
- **Pure Desktop Companion:** Rests unobtrusively anchored at the top-center of your screen (Dynamic Island overlay).

---

## 🏷️ Application Provenance & Identification

| Property | Details |
| :--- | :--- |
| **Product Name** | NOVA Desktop Companion |
| **Executable Name** | `NOVA.exe` |
| **Version** | `1.0.0.0` |
| **Publisher / Organization** | `CN=NOVA Desktop Companion, O=NOVA Project` |
| **Digital Certificate Hash (SHA-1)** | `8680A69C67DB54CBFACF3505A6DABFE05F684503` |
| **Signature Type** | Microsoft Authenticode (SHA-256) |
| **License** | MIT License |
| **Primary Binary Path** | `NOVA.exe` (Root & Desktop) |
| **Core Runtime Engine** | `dist-app\NOVA.exe` |

---

## 🔐 Cryptographic Checksums (SHA-256)

Use these hashes to verify that the binaries have not been altered or tampered with:

| File Name | SHA-256 Checksum |
| :--- | :--- |
| **`NOVA.exe`** (Launcher) | `2FAD8B29D088209F58D495CF70C36825E4ACE3582FD7C2F45A2AB33021B86670` |
| **`dist-app\NOVA.exe`** (Core) | `5454B5A0C78DFD3F387E17988569984733E7D3E498CC84D99E7BAB1699121795` |
| **`NOVA-Certificate.cer`** | `8ED8AA99769865091FFB5A2990F7FF4114322CBFFD2A252572169FF37A818517` |
| **`Install-Certificate.bat`** | `484B3E8AD76CA4E699B80DCB1A5D315281B98349E999EBEE8F12F767E01AC234` |
| **`Enable-AutoStart.bat`** | `E0EF538231509BF757D9E1E0E66A57CE6E2ADA40F25AE31B4A8973CA258B37B5` |
| **`Disable-AutoStart.bat`** | `1BD44DD0EFF226BAEF117972D5A37508946131C641CB8C2B3E8B8401DA800906` |

You can verify these checksums anytime by double-clicking **`Verify-Signatures.bat`**.

---

## 🛡️ Windows Defender & SmartScreen Clarification

### Why Does Windows SmartScreen Show "Unknown Publisher" on New Builds?
Microsoft Windows SmartScreen uses a cloud-reputation system. Any newly compiled software that has not yet been downloaded by thousands of worldwide users is marked as "Unknown Publisher" until a trusted Authenticode code-signing certificate is installed in your local Windows Certificate Store.

### 1-Click Trusted Certificate Installation
To register the publisher certificate with Windows Defender and SmartScreen:
1. Double-click **`Install-Certificate.bat`** in this folder.
2. It automatically imports `NOVA-Certificate.cer` into your Windows **Trusted Publishers** and **Root Certification Authorities** stores.
3. Once completed, Windows Defender recognizes `NOVA.exe` as digitally signed by `NOVA Project`.

---

## ⚡ How to Auto-Start on Windows Boot / Restart

You have two convenient options to ensure NOVA launches automatically when your PC turns on:

### Option A: From Inside NOVA Settings
1. Launch **NOVA** (press <kbd>Alt</kbd> + <kbd>Space</kbd> or hover over the top-center island).
2. Open the **Settings** view (gear icon).
3. Scroll down to **SYSTEM & WINDOWS STARTUP**.
4. Check **Start NOVA automatically on system boot**.

### Option B: 1-Click Script
- Run **`Enable-AutoStart.bat`** to enable startup on Windows boot.
- Run **`Disable-AutoStart.bat`** to disable it at any time.

---

## 🚀 Launching the Software
- **Desktop:** Double-click the **`NOVA.exe`** icon directly on your Desktop.
- **Folder:** Double-click **`NOVA.exe`** in this project folder.
- **Hotkey:** Press <kbd>Alt</kbd> + <kbd>Space</kbd> anytime to reveal or collapse the companion.
