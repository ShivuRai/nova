# NOVA Windows builds

The current Windows desktop application uses Electron. Keep the portable runtime, its resources, and shared libraries together when moving it.

## Run from the source checkout

Use Node.js 24 LTS and run:

```powershell
npm ci
npm test
npm run build
npm start
```

For frontend development, run `npm run dev` in one terminal and `npm start -- --dev` in a second terminal.

## Refresh or create the portable build

```powershell
npm run build:desktop
```

Start `dist-app\NOVA.exe` or double-click `NOVA.bat` in the checkout. When sharing a portable build, include the complete `dist-app` directory.

## Tauri

The Rust/Tauri variant remains in `src-tauri` and the current GitHub workflow builds that variant. Use `npm run tauri -- build` for the Tauri development target. Windows integrations exposed by the Electron preload need separate Tauri implementations before the two builds can offer the same tools.
