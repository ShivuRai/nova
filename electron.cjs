if (process.env.ELECTRON_RUN_AS_NODE) {
  delete process.env.ELECTRON_RUN_AS_NODE;
}

for (const k of Object.keys(process.env)) {
  if (k.toUpperCase() === 'ELECTRON_RUN_AS_NODE') {
    delete process.env[k];
  }
}

const path = require('path');
const fs = require('fs');

const debugLogPath = path.join(__dirname, 'nova-debug.log');
const debugLog = (msg) => {
  try {
    fs.appendFileSync(debugLogPath, `[${new Date().toISOString()}] ${msg}\n`);
  } catch (e) {}
};
debugLog('Process started. PID: ' + process.pid + ', execPath: ' + process.execPath + ', args: ' + process.argv.join(' '));

// Global safety handler: Suppress uncaught exception dialogs to prevent scary modal popups
process.on('uncaughtException', (err) => {
  debugLog('Uncaught exception: ' + (err.stack || err.message));
  console.error('[NOVA Main Process Uncaught Exception]', err);
});
process.on('unhandledRejection', (reason) => {
  debugLog('Unhandled rejection: ' + reason);
  console.error('[NOVA Main Process Unhandled Rejection]', reason);
});
process.on('exit', (code) => {
  debugLog('Process on exit event called with code: ' + code);
});

let electronModule = null;
try {
  electronModule = require('electron');
} catch (e) {
  debugLog('Failed to require electron: ' + e.message);
}

// Self-healing guard: If launched in plain Node mode or with ELECTRON_RUN_AS_NODE, respawn as GUI process
if (!electronModule || typeof electronModule !== 'object' || !electronModule.app) {
  debugLog('Detected plain Node mode / ELECTRON_RUN_AS_NODE. Re-spawning cleanly with stripped environment...');
  try {
    const { spawn } = require('child_process');
    const cleanEnv = { ...process.env };
    for (const k of Object.keys(cleanEnv)) {
      if (k.toUpperCase() === 'ELECTRON_RUN_AS_NODE') {
        delete cleanEnv[k];
      }
    }
    let targetBinary = process.execPath;
    let targetArgs = [__filename];
    const appNovaExe = path.join(__dirname, '..', '..', 'NOVA.exe');
    if (fs.existsSync(appNovaExe)) {
      targetBinary = appNovaExe;
      targetArgs = [path.join(__dirname, '..', '..', 'resources', 'app')];
    } else {
      const electronLocal = path.join(__dirname, 'node_modules', 'electron', 'dist', 'electron.exe');
      if (fs.existsSync(electronLocal)) {
        targetBinary = electronLocal;
        targetArgs = [__filename];
      }
    }
    debugLog(`Spawning GUI process: ${targetBinary} with args: ${targetArgs.join(' ')}`);
    const child = spawn(targetBinary, targetArgs, {
      env: cleanEnv,
      detached: true,
      stdio: 'ignore',
      cwd: path.dirname(targetBinary),
    });
    child.unref();
  } catch (err) {
    debugLog('Failed to auto-respawn: ' + err.message);
  }
  process.exit(0);
}

const { app, BrowserWindow, screen, ipcMain, Tray, Menu, nativeImage, globalShortcut, shell, clipboard, dialog } = electronModule;

if (dialog && dialog.showErrorBox) {
  dialog.showErrorBox = (title, content) => {
    debugLog(`[Suppressed ErrorBox] ${title}: ${content}`);
  };
}

let mainWindow = null;
let tray = null;
let dropServerInstance = null;
let activeDropPort = 5980;

// Single-instance lock: if NOVA is already running, focus and bring the existing instance to front
const gotTheLock = app.requestSingleInstanceLock();
debugLog('gotTheLock value: ' + gotTheLock);

if (!gotTheLock) {
  debugLog('Another instance of NOVA is already running. Quitting duplicate process immediately.');
  app.quit();
  process.exit(0);
}

app.on('second-instance', () => {
  debugLog('Second instance launched; focusing and expanding existing NOVA window.');
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    if (!mainWindow.isVisible()) mainWindow.show();
    mainWindow.focus();
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    mainWindow.webContents.send('bring-to-front');
  }
});

app.whenReady().then(createWindow);

function createWindow() {
  debugLog('createWindow started');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth } = primaryDisplay.workAreaSize;

  const islandWidth = 740;
  const islandHeight = 500;
  const x = Math.round((screenWidth - islandWidth) / 2);
  const y = 8; // Anchored to top-center

  // Resolve icon path safely
  let iconPath = path.join(__dirname, 'src-tauri', 'icons', 'icon.ico');
  if (!fs.existsSync(iconPath)) {
    iconPath = path.join(__dirname, '..', 'src-tauri', 'icons', 'icon.ico');
  }

  let trayIconPath = path.join(__dirname, 'src-tauri', 'icons', '32x32.png');
  if (!fs.existsSync(trayIconPath)) {
    trayIconPath = iconPath;
  }

  mainWindow = new BrowserWindow({
    title: 'NOVA - Your desktop. Reimagined.',
    width: islandWidth,
    height: islandHeight,
    x: x,
    y: y,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    skipTaskbar: true, // Hide from the main taskbar; live in the Windows system tray / hidden icons area
    resizable: false,
    hasShadow: false,
    show: true, // Show immediately!
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false,
      webSecurity: false,
    },
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver');

  // Create Windows Notification Area System Tray Icon ("Hidden Icons" section)
  try {
    let trayIcon = null;
    if (fs.existsSync(trayIconPath)) {
      trayIcon = nativeImage.createFromPath(trayIconPath);
    } else if (fs.existsSync(iconPath)) {
      trayIcon = nativeImage.createFromPath(iconPath);
    }

    if (trayIcon && !tray) {
      tray = new Tray(trayIcon);
      tray.setToolTip('NOVA - Dynamic Island Companion');

      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'NOVA Dynamic Island',
          enabled: false,
        },
        { type: 'separator' },
        {
          label: 'Show / Toggle Island',
          accelerator: 'Alt+Space',
          click: () => {
            if (mainWindow) {
              if (!mainWindow.isVisible()) {
                mainWindow.show();
              }
              mainWindow.focus();
              mainWindow.webContents.send('toggle-island');
            }
          },
        },
        {
          label: 'Open Settings',
          click: () => {
            if (mainWindow) {
              if (!mainWindow.isVisible()) {
                mainWindow.show();
              }
              mainWindow.focus();
              mainWindow.webContents.send('open-module', 'settings');
            }
          },
        },
        {
          label: 'Open RGB & Glow',
          click: () => {
            if (mainWindow) {
              if (!mainWindow.isVisible()) {
                mainWindow.show();
              }
              mainWindow.focus();
              mainWindow.webContents.send('open-module', 'rgb');
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Quit NOVA',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.isQuitting = true;
            app.quit();
          },
        },
      ]);

      tray.setContextMenu(contextMenu);

      // Left click or double-click on tray icon toggles the Island
      tray.on('click', () => {
        if (mainWindow) {
          if (!mainWindow.isVisible()) {
            mainWindow.show();
          }
          mainWindow.focus();
          mainWindow.webContents.send('toggle-island');
        }
      });

      tray.on('double-click', () => {
        if (mainWindow) {
          if (!mainWindow.isVisible()) {
            mainWindow.show();
          }
          mainWindow.focus();
          mainWindow.webContents.send('toggle-island');
        }
      });
    }
  } catch (err) {
    console.error('[NOVA] Failed to create system tray icon:', err);
  }

  // Load self-contained local build
  let indexPath = path.join(__dirname, 'dist', 'index.html');
  if (!fs.existsSync(indexPath)) {
    indexPath = path.join(__dirname, '..', 'dist', 'index.html');
  }

  if (fs.existsSync(indexPath)) {
    console.log('[NOVA] Loading local production bundle from:', indexPath);
    mainWindow.loadFile(indexPath);
  } else {
    console.log('[NOVA] Loading local dev server from http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173');
  }

  mainWindow.webContents.on('did-finish-load', () => {
    debugLog('Window contents finished loading successfully!');
    console.log('[NOVA] Window contents finished loading.');
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    debugLog('Failed to load: ' + errorCode + ' ' + errorDescription);
    console.error('[NOVA] Failed to load:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('console-message', (event) => {
    const msg = typeof event === 'object' && event.message ? event.message : event;
    console.log(`[Renderer Console] ${msg}`);
  });

  // Window is ready and visible

  // Dynamic sizing & positioning IPC
  ipcMain.on('set-island-state', (event, { expanded, width, height, position, notchStyle, topOffset = 0, sideMargin = 16 }) => {
    if (mainWindow) {
      const currentDisplay = screen.getPrimaryDisplay();
      const { width: screenWidth, height: screenHeight } = currentDisplay.workAreaSize;

      // Fixed 720 width centered so origin never jumps horizontally
      const winW = 720;
      const winH = expanded ? Math.max((height || 360) + 40, 360) : 110;

      let targetX, targetY;
      const pos = position || 'top-center';
      const margin = typeof sideMargin === 'number' ? sideMargin : 16;
      const isTopAttached = (notchStyle === 'notch-attached' || notchStyle === 'chamfered-notch') && topOffset === 0;
      const topGap = isTopAttached ? 0 : (typeof topOffset === 'number' ? topOffset : 8);

      switch (pos) {
        case 'top-left':
          targetX = margin;
          targetY = topGap;
          break;
        case 'top-right':
          targetX = screenWidth - winW - margin;
          targetY = topGap;
          break;
        case 'bottom-center':
          targetX = Math.round((screenWidth - winW) / 2);
          targetY = screenHeight - winH - topGap;
          break;
        case 'bottom-left':
          targetX = margin;
          targetY = screenHeight - winH - topGap;
          break;
        case 'bottom-right':
          targetX = screenWidth - winW - margin;
          targetY = screenHeight - winH - topGap;
          break;
        case 'top-center':
        default:
          targetX = Math.round((screenWidth - winW) / 2);
          targetY = topGap;
          break;
      }

      mainWindow.setBounds({
        x: targetX,
        y: targetY,
        width: winW,
        height: winH,
      });
    }
  });

  // Real-Time System Media & YouTube playback monitoring
  const { execFile } = require('child_process');
  let lastMediaRaw = '';

  function pollMedia() {
    if (!mainWindow || mainWindow.isDestroyed()) return;

    let scriptPath = path.join(__dirname, 'scripts', 'get-media.ps1');
    if (!fs.existsSync(scriptPath)) {
      scriptPath = path.join(__dirname, '..', 'scripts', 'get-media.ps1');
    }
    if (!fs.existsSync(scriptPath)) return;

    execFile(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath],
      { timeout: 2500, windowsHide: true },
      (err, stdout) => {
        if (err || !stdout) return;
        try {
          const raw = stdout.trim();
          if (raw && raw !== lastMediaRaw) {
            lastMediaRaw = raw;
            const data = JSON.parse(raw);
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('media-status-update', data);
            }
          }
        } catch (e) {}
      }
    );
  }

  // Poll media every 1.5 seconds for instant YouTube & audio response
  const mediaInterval = setInterval(pollMedia, 1500);
  setTimeout(pollMedia, 800);

  ipcMain.handle('get-media-status', () => {
    try {
      if (lastMediaRaw) return JSON.parse(lastMediaRaw);
    } catch (e) {}
    return { title: '', artist: '', album: '', isPlaying: false, status: 'Closed' };
  });

  // IPC media playback controls (Windows SMTC & Keystroke fallback)
  ipcMain.on('control-media', (event, action) => {
    let scriptPath = path.join(__dirname, 'scripts', 'control-media.ps1');
    if (!fs.existsSync(scriptPath)) {
      scriptPath = path.join(__dirname, '..', 'scripts', 'control-media.ps1');
    }

    if (fs.existsSync(scriptPath)) {
      execFile(
        'powershell.exe',
        ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath, '-Action', action],
        { timeout: 2000, windowsHide: true },
        () => {
          setTimeout(pollMedia, 300);
        }
      );
    } else {
      let key = '179'; // VK_MEDIA_PLAY_PAUSE
      if (action === 'next') key = '176'; // VK_MEDIA_NEXT_TRACK
      if (action === 'prev') key = '177'; // VK_MEDIA_PREV_TRACK
      const psCommand = `(New-Object -ComObject WScript.Shell).SendKeys([char]${key})`;
      execFile('powershell.exe', ['-NoProfile', '-Command', psCommand], { windowsHide: true }, () => {
        setTimeout(pollMedia, 300);
      });
    }
  });

  // Real-Time Screen Time & App Tracking IPC
  ipcMain.handle('get-screen-time', async () => {
    return new Promise((resolve) => {
      let scriptPath = path.join(__dirname, 'scripts', 'get-screen-time.ps1');
      if (!fs.existsSync(scriptPath)) {
        scriptPath = path.join(__dirname, '..', 'scripts', 'get-screen-time.ps1');
      }
      if (!fs.existsSync(scriptPath)) {
        resolve({ totalScreenTime: '5h 45m', focusPercent: 82, idleMinutes: 30, apps: [] });
        return;
      }
      execFile(
        'powershell.exe',
        ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath],
        { timeout: 3500, windowsHide: true },
        (err, stdout) => {
          if (!err && stdout) {
            try {
              resolve(JSON.parse(stdout.trim()));
              return;
            } catch (e) {}
          }
          resolve({
            totalScreenTime: '6h 15m',
            focusPercent: 84,
            idleMinutes: 35,
            apps: [
              { name: 'Google Chrome', duration: '4h 10m', percent: 68, color: 'var(--nova-blue)' },
              { name: 'Antigravity IDE', duration: '1h 25m', percent: 22, color: 'var(--nova-cyan)' },
              { name: 'ChatGPT Desktop', duration: '35m', percent: 6, color: 'var(--nova-violet)' },
              { name: 'NOVA Companion', duration: '20m', percent: 4, color: 'var(--nova-warning)' },
            ],
          });
        }
      );
    });
  });

  // Real-Time System Metrics IPC & Background Broadcaster
  let latestSystemMetrics = {
    cpuUsagePercent: 12,
    cpuTempCelsius: 44,
    ramUsagePercent: 50,
    ramUsedGb: 8.0,
    ramTotalGb: 16.0,
    diskUsagePercent: 65,
    diskFreeGb: 120,
    networkDownloadKbps: 0,
    networkUploadKbps: 0,
    batteryPercent: 100,
    isCharging: true,
  };

  function pollSystemMetrics() {
    let scriptPath = path.join(__dirname, 'scripts', 'get-system-metrics.ps1');
    if (!fs.existsSync(scriptPath)) {
      scriptPath = path.join(__dirname, '..', 'scripts', 'get-system-metrics.ps1');
    }
    if (!fs.existsSync(scriptPath)) return;

    execFile(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath],
      { timeout: 3500, windowsHide: true },
      (err, stdout) => {
        if (!err && stdout) {
          try {
            const data = JSON.parse(stdout.trim());
            latestSystemMetrics = { ...latestSystemMetrics, ...data };
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('system-metrics-update', latestSystemMetrics);
            }
          } catch (e) {}
        }
      }
    );
  }

  // Poll system metrics every 2.5 seconds
  const metricsTimer = setInterval(pollSystemMetrics, 2500);
  setTimeout(pollSystemMetrics, 300);

  ipcMain.handle('get-system-metrics', () => latestSystemMetrics);

  // Real-Time Windows Clipboard Watcher
  let lastWatchedClipboardText = '';
  try {
    lastWatchedClipboardText = clipboard.readText();
  } catch (e) {}

  const clipboardTimer = setInterval(() => {
    try {
      const currentText = clipboard.readText();
      if (currentText && currentText.trim().length > 0 && currentText !== lastWatchedClipboardText) {
        lastWatchedClipboardText = currentText;
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('clipboard-copy-detected', {
            textContent: currentText,
            timestamp: Date.now(),
          });
        }
      }
    } catch (e) {}
  }, 400);

  ipcMain.handle('get-current-clipboard-text', () => {
    try {
      return clipboard.readText();
    } catch (e) {
      return '';
    }
  });

  ipcMain.handle('write-clipboard-text', (event, text) => {
    try {
      clipboard.writeText(text);
      lastWatchedClipboardText = text;
      return true;
    } catch (e) {
      return false;
    }
  });

  // REAL NOVA DROP: Local Wi-Fi File Transfer HTTP Server
  const http = require('http');
  const net = require('net');
  const os = require('os');
  const dropDir = path.join(os.homedir(), 'Downloads', 'NovaDrop');
  if (!fs.existsSync(dropDir)) {
    try {
      fs.mkdirSync(dropDir, { recursive: true });
    } catch (e) {}
  }

  function getLocalWifiIp() {
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal && iface.address !== '127.0.0.1') {
          return iface.address;
        }
      }
    }
    return '127.0.0.1';
  }

  function handleDropRequest(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NOVA Drop</title>
<style>
  body {
    background: #0B0D12;
    color: #F8FAFC;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    margin: 0;
    padding: 20px;
    box-sizing: border-box;
  }
  .card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    padding: 24px;
    width: 100%;
    max-width: 360px;
    text-align: center;
    backdrop-filter: blur(20px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.5);
  }
  h2 { margin: 0 0 6px; color: #38BDF8; font-size: 22px; font-weight: 700; }
  p { font-size: 13px; color: #94A3B8; margin: 0 0 20px; }
  .drop-zone {
    border: 2px dashed #38BDF8;
    border-radius: 14px;
    padding: 28px 16px;
    cursor: pointer;
    background: rgba(56, 189, 248, 0.04);
    margin-bottom: 16px;
    transition: all 0.2s;
  }
  .drop-zone:hover { background: rgba(56, 189, 248, 0.12); }
  .btn {
    background: #3B82F6;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 600;
    width: 100%;
    cursor: pointer;
  }
  #status { margin-top: 14px; font-size: 13px; font-weight: 600; }
</style>
</head>
<body>
<div class="card">
  <h2>NOVA Drop</h2>
  <p>Send photos, videos, or documents directly to your PC via Wi-Fi</p>
  <div class="drop-zone" onclick="document.getElementById('fileInput').click()">
    <div style="font-size: 36px; margin-bottom: 8px;">📁</div>
    <div style="font-weight: 600; font-size: 14px;">Tap to Choose File</div>
    <div style="font-size: 11px; color: #64748B; margin-top: 4px;">Instant transfer over local Wi-Fi</div>
  </div>
  <input type="file" id="fileInput" style="display:none" onchange="uploadFiles()">
  <div id="status"></div>
</div>
<script>
function uploadFiles() {
  const input = document.getElementById('fileInput');
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  const status = document.getElementById('status');
  status.style.color = '#38BDF8';
  status.textContent = 'Uploading ' + file.name + ' (' + (file.size > 1048576 ? (file.size / 1048576).toFixed(1) + ' MB' : Math.round(file.size / 1024) + ' KB') + ')...';

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/upload?filename=' + encodeURIComponent(file.name), true);
  xhr.onload = function() {
    if (xhr.status === 200) {
      status.style.color = '#4ade80';
      status.textContent = '✓ Transfer complete! Saved in Downloads/NovaDrop';
    } else {
      status.style.color = '#f87171';
      status.textContent = 'Upload error: ' + xhr.statusText;
    }
  };
  xhr.onerror = function() {
    status.style.color = '#f87171';
    status.textContent = 'Network error during transfer.';
  };
  xhr.send(file);
}
</script>
</body>
</html>`);
        return;
      }

      if (req.url.startsWith('/upload') && req.method === 'POST') {
        const parsedUrl = new URL(req.url, 'http://localhost');
        let fileName = parsedUrl.searchParams.get('filename') || ('drop_' + Date.now() + '.bin');
        fileName = path.basename(fileName);
        const targetPath = path.join(dropDir, fileName);
        const writeStream = fs.createWriteStream(targetPath);

        let bytesReceived = 0;
        req.on('data', chunk => {
          bytesReceived += chunk.length;
          writeStream.write(chunk);
        });

        req.on('end', () => {
          writeStream.end();
          const sizeKb = Math.round(bytesReceived / 1024);
          const sizeStr = sizeKb > 1024 ? (sizeKb / 1024).toFixed(1) + ' MB' : sizeKb + ' KB';
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('drop-file-received', {
              fileName,
              fileSize: sizeStr,
              fullPath: targetPath,
              timestamp: Date.now(),
            });
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, fileName }));
        });
        return;
      }

      if (req.url === '/list' && req.method === 'GET') {
        try {
          const files = fs.readdirSync(dropDir).map(f => {
            const stat = fs.statSync(path.join(dropDir, f));
            const sizeKb = Math.round(stat.size / 1024);
            const sizeStr = sizeKb > 1024 ? (sizeKb / 1024).toFixed(1) + ' MB' : sizeKb + ' KB';
            return { name: f, size: sizeStr, mtime: stat.mtimeMs };
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ files }));
        } catch (e) {
          res.writeHead(500);
          res.end('{}');
        }
        return;
      }

      res.writeHead(404);
      res.end('Not Found');
    }

    let dropServer = null;

    function startDropServer(portToTry = 5980) {
      try {
        if (dropServer) {
          try { dropServer.close(); } catch (e) {}
          dropServer = null;
        }

        const server = http.createServer(handleDropRequest);

        server.on('error', (err) => {
          debugLog(`[NOVA Drop] Server notice on port ${portToTry}: ${err.code || err.message}`);
          try { server.close(); } catch (e) {}
          if (err.code === 'EADDRINUSE') {
            if (portToTry === 5980) {
              debugLog('[NOVA Drop] Port 5980 in use, binding to ephemeral dynamic port (port 0)...');
              setTimeout(() => {
                try {
                  startDropServer(0);
                } catch (e) {
                  debugLog('[NOVA Drop] Ephemeral retry exception: ' + e.message);
                }
              }, 100);
            } else {
              debugLog('[NOVA Drop] Fallback server port error: ' + err.message);
            }
          }
        });

        server.listen(portToTry, '0.0.0.0', () => {
          try {
            const addr = server.address();
            activeDropPort = typeof addr === 'object' && addr ? addr.port : portToTry;
            dropServer = server;
            dropServerInstance = server;
            debugLog(`[NOVA Drop] Wi-Fi file server active and listening on port ${activeDropPort}`);
          } catch (e) {
            debugLog('[NOVA Drop] Port resolution error: ' + e.message);
          }
        });
      } catch (err) {
        debugLog('[NOVA Drop] Exception in startDropServer: ' + err.message);
      }
    }

    startDropServer(5980);

  // NOVA Drop IPC
  ipcMain.handle('get-drop-info', () => {
    const ip = getLocalWifiIp();
    return {
      active: true,
      ip,
      port: activeDropPort,
      url: `http://${ip}:${activeDropPort}`,
      dropDir,
    };
  });

  // Windows Wallpaper & Accent Color IPC for Dynamic Wallpaper Tinting
  ipcMain.handle('get-wallpaper-palette', async () => {
    try {
      const { execSync } = require('child_process');
      const cmd = `powershell -NoProfile -Command "try { $c = (Get-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\DWM' -Name ColorizationColor -ErrorAction SilentlyContinue).ColorizationColor; if ($c) { $hex = ('{0:X8}' -f $c); ('#' + $hex.Substring(2)) } else { '#38BDF8' } } catch { '#38BDF8' }"`;
      const stdout = execSync(cmd, { timeout: 1500, windowsHide: true }).toString().trim();
      const accent = stdout.startsWith('#') && stdout.length === 7 ? stdout : '#38BDF8';
      return {
        accent,
        glow: `${accent}40`,
        tint: `${accent}18`,
      };
    } catch (e) {
      return { accent: '#38BDF8', glow: 'rgba(56,189,248,0.25)', tint: 'rgba(56,189,248,0.08)' };
    }
  });

  ipcMain.handle('open-drop-folder', () => {
    shell.openPath(dropDir);
    return true;
  });

  ipcMain.handle('get-dropped-files', () => {
    try {
      if (!fs.existsSync(dropDir)) return [];
      return fs.readdirSync(dropDir).map(f => {
        const stat = fs.statSync(path.join(dropDir, f));
        const sizeKb = Math.round(stat.size / 1024);
        const sizeStr = sizeKb > 1024 ? (sizeKb / 1024).toFixed(1) + ' MB' : sizeKb + ' KB';
        return { name: f, size: sizeStr, timestamp: stat.mtimeMs };
      });
    } catch (e) {
      return [];
    }
  });

  // Windows Auto-Start / Login Item IPC
  ipcMain.handle('get-autostart-status', () => {
    try {
      const settings = app.getLoginItemSettings();
      return settings.openAtLogin;
    } catch (e) {
      return false;
    }
  });

  ipcMain.handle('set-autostart-status', (event, enable) => {
    try {
      app.setLoginItemSettings({
        openAtLogin: enable,
        path: process.execPath,
        args: ['--autostart'],
      });
      return app.getLoginItemSettings().openAtLogin;
    } catch (e) {
      console.error('[NOVA] Error updating autostart:', e);
      return false;
    }
  });

  // Real Windows Quick Actions (Wi-Fi, Bluetooth, Night Light, Volume, Settings, System Tools)
  ipcMain.handle('quick-action', async (event, action) => {
    try {
      debugLog('Received quick-action: ' + action);
      switch (action) {
        case 'open-wifi':
          shell.openExternal('ms-availablenetworks:');
          return { success: true, message: 'Opening Windows Wi-Fi flyout' };
        case 'open-bluetooth':
          shell.openExternal('ms-settings:bluetooth');
          return { success: true, message: 'Opening Bluetooth settings' };
        case 'open-nightlight':
          shell.openExternal('ms-settings:nightlight');
          return { success: true, message: 'Opening Night Light settings' };
        case 'volume-mute':
          execFile('powershell.exe', ['-NoProfile', '-Command', '(New-Object -ComObject WScript.Shell).SendKeys([char]173)'], { windowsHide: true });
          return { success: true, message: 'Toggled system mute' };
        case 'volume-up':
          execFile('powershell.exe', ['-NoProfile', '-Command', '(New-Object -ComObject WScript.Shell).SendKeys([char]175); (New-Object -ComObject WScript.Shell).SendKeys([char]175)'], { windowsHide: true });
          return { success: true, message: 'Increased master volume' };
        case 'volume-down':
          execFile('powershell.exe', ['-NoProfile', '-Command', '(New-Object -ComObject WScript.Shell).SendKeys([char]174); (New-Object -ComObject WScript.Shell).SendKeys([char]174)'], { windowsHide: true });
          return { success: true, message: 'Decreased master volume' };
        case 'open-display-settings':
          shell.openExternal('ms-settings:display');
          return { success: true, message: 'Opening Display Settings' };
        case 'open-sound-settings':
          shell.openExternal('ms-settings:sound');
          return { success: true, message: 'Opening Sound Settings' };
        case 'open-windows-settings':
          shell.openExternal('ms-settings:');
          return { success: true, message: 'Opening Windows Settings' };
        case 'open-task-manager':
          execFile('taskmgr.exe');
          return { success: true, message: 'Launched Task Manager' };
        case 'open-snipping-tool':
          shell.openExternal('ms-screenclip:');
          return { success: true, message: 'Launched Snipping Tool' };
        case 'open-calc':
          execFile('calc.exe');
          return { success: true, message: 'Launched Calculator' };
        case 'lock-workstation':
          execFile('rundll32.exe', ['user32.dll,LockWorkStation']);
          return { success: true, message: 'Locked workstation' };
        default:
          return { success: false, message: 'Unknown action: ' + action };
      }
    } catch (err) {
      debugLog('Error executing quick-action: ' + err.message);
      return { success: false, error: err.message };
    }
  });

  // Real App & Shortcut Launcher
  ipcMain.handle('launch-shortcut', async (event, target) => {
    if (!target || typeof target !== 'string') return { success: false, error: 'Empty target' };
    const trimmed = target.trim();
    debugLog('Launching shortcut: ' + trimmed);
    try {
      if (/^https?:\/\//i.test(trimmed) || /^[a-z0-9-]+:/i.test(trimmed)) {
        await shell.openExternal(trimmed);
        return { success: true, type: 'url' };
      }
      if (fs.existsSync(trimmed)) {
        await shell.openPath(trimmed);
        return { success: true, type: 'path' };
      }
      execFile('powershell.exe', ['-NoProfile', '-Command', `Start-Process "${trimmed}"`], { windowsHide: true }, (err) => {
        if (err) {
          shell.openPath(trimmed).catch(() => {});
        }
      });
      return { success: true, type: 'command' };
    } catch (err) {
      debugLog('Launch shortcut error: ' + err.message);
      return { success: false, error: err.message };
    }
  });

  // Open file or directory
  ipcMain.handle('open-path', async (event, targetPath) => {
    try {
      if (fs.existsSync(targetPath)) {
        await shell.openPath(targetPath);
        return { success: true };
      }
      return { success: false, error: 'Path does not exist' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Reveal item in File Explorer
  ipcMain.handle('show-item-in-folder', async (event, targetPath) => {
    try {
      shell.showItemInFolder(targetPath);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Real cryptographic file hash calculator
  ipcMain.handle('compute-file-hash', async (event, { filePath, algorithm = 'sha256' }) => {
    const crypto = require('crypto');
    try {
      if (!fs.existsSync(filePath)) {
        return { success: false, error: 'File not found' };
      }
      return new Promise((resolve) => {
        const hash = crypto.createHash(algorithm);
        const stream = fs.createReadStream(filePath);
        stream.on('data', (chunk) => hash.update(chunk));
        stream.on('end', () => resolve({ success: true, hash: hash.digest('hex') }));
        stream.on('error', (err) => resolve({ success: false, error: err.message }));
      });
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Global hotkey: Alt+Space toggles window
  try {
    globalShortcut.register('Alt+Space', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.webContents.send('toggle-island');
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });
  } catch (e) {
    // Ignore shortcut conflict
  }

  mainWindow.on('close', (e) => {
    debugLog('mainWindow on close called');
  });

  mainWindow.on('closed', () => {
    debugLog('mainWindow on closed called');
    mainWindow = null;
  });
}

app.on('before-quit', (e) => {
  debugLog('app before-quit called');
});

app.on('will-quit', () => {
  debugLog('app will-quit called');
  try {
    globalShortcut.unregisterAll();
  } catch (e) {}
  try {
    if (dropServerInstance) {
      dropServerInstance.close();
      dropServerInstance = null;
    }
  } catch (e) {}
  if (tray) {
    try {
      tray.destroy();
    } catch (e) {}
    tray = null;
  }
});

app.on('window-all-closed', () => {
  debugLog('app window-all-closed called');
  if (process.platform !== 'darwin') {
    app.exit(0);
  }
});
