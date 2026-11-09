# NOVA Release and Packaging Guide

**Document ID:** NOVA-REL-001  
**Target:** Windows 10 & 11 (64-bit)  
**Binary Artifacts:**
1. **NOVA-Setup.exe:** Standard Windows NSIS installer with desktop shortcut and optional startup entry.
2. **NOVA-Portable.zip:** Portable zero-install zip archive containing the executable and `./data/` local sandbox.

---

## 1. Local Development Build

To run the application with live hot reload during development:

```bash
# Terminal 1: Launch Tauri dev runner
npm run tauri dev
```

---

## 2. Production Packaging

To compile optimized release binaries:

```bash
# Build frontend and Rust release binary
npm run tauri build
```

This compiles:
- `src-tauri/target/release/nova.exe`
- `src-tauri/target/release/bundle/nsis/NOVA_1.0.0_x64-setup.exe`
- Portable binary deployable alongside a local `./data` folder.
