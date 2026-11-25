# NOVA Windows security and verification

## Runtime and data

The Electron renderer uses an isolated preload bridge with an allowlist of desktop actions. The production page uses a Content Security Policy and opens supported web links in the system browser. Desktop preferences, notes, and text clipboard history are stored locally in the Electron application profile. Clipboard capture can be switched off in Settings. Weather and website checks make network requests when used.

NOVA Drop listens only during a receiving session. Its QR and URL carry a random pairing token. The link expires after ten minutes, and the receiver can be stopped from the Drop view. Files are written to the Windows Downloads folder under `NovaDrop`. Drop uses HTTP on the selected local network interface.

## Inspecting a build

Use `Verify-Signatures.bat` or PowerShell’s `Get-AuthenticodeSignature` and `Get-FileHash -Algorithm SHA256` on the exact files you received. The root `NOVA.exe` launcher and `dist-app\NOVA.exe` runtime are distinct files. The Electron application code lives under `dist-app\resources\app` in the portable build, so checking the runtime executable alone does not verify the JavaScript payload.

The repository contains a legacy self-signed certificate and install script. That script changes the Windows user’s trust stores. The source checkout and portable build can be built and inspected independently of that script.

## Startup

The in-app startup option is under Settings → Windows & privacy. The legacy Windows Startup-folder scripts use a separate shortcut-based mechanism.
