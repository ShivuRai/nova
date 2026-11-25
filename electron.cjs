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
const { execFile, spawn } = require('child_process');
const execFileAsync = require('util').promisify(execFile);
const { calculateIslandBounds } = require('./window-bounds.cjs');
const { createDropReceiver } = require('./drop-receiver.cjs');

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
    let targetBinary;
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
    if (!targetBinary) throw new Error('Electron runtime unavailable');
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

const { app, BrowserWindow, screen, ipcMain, Tray, Menu, nativeImage, globalShortcut, shell, clipboard, dialog, systemPreferences, powerMonitor } = electronModule;

let mainWindow = null;
let tray = null;
let dropReceiver = null;

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
  const initialBounds = calculateIslandBounds(primaryDisplay.workArea, { width: 268, height: 38 });

  // Resolve icon path safely across packaged and development layouts
  const resolveIconPath = (fileName) => {
    const candidates = [
      path.join(__dirname, 'src-tauri', 'icons', fileName),
      path.join(__dirname, '..', 'src-tauri', 'icons', fileName),
      path.join(__dirname, '..', '..', 'src-tauri', 'icons', fileName),
      path.join(__dirname, '..', '..', '..', 'src-tauri', 'icons', fileName),
      path.join(process.resourcesPath || '', 'app', 'src-tauri', 'icons', fileName),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return null;
  };

  const iconPath = resolveIconPath('icon.ico') || resolveIconPath('32x32.png');
  const trayIconPath = resolveIconPath('32x32.png') || resolveIconPath('icon.ico');

  mainWindow = new BrowserWindow({
    title: 'NOVA - Your desktop. Reimagined.',
    ...initialBounds,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    skipTaskbar: true, // Hide from the main taskbar; live in the Windows system tray / hidden icons area
    resizable: false,
    hasShadow: false,
    show: false,
    icon: iconPath && fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver');

  mainWindow.setIgnoreMouseEvents(true, { forward: true });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event) => event.preventDefault());
  mainWindow.webContents.on('will-attach-webview', (event) => event.preventDefault());
  const send = (channel, ...args) => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send(channel, ...args);
  };
  const handle = (channel, listener) => ipcMain.handle(channel, (event, ...args) => {
    if (!mainWindow || event.senderFrame !== mainWindow.webContents.mainFrame) throw new Error('Unsupported NOVA window');
    return listener(event, ...args);
  });
  const on = (channel, listener) => ipcMain.on(channel, (event, ...args) => {
    if (mainWindow && event.senderFrame === mainWindow.webContents.mainFrame) listener(event, ...args);
  });

  // Create Windows Notification Area System Tray Icon ("Hidden Icons" section)
  try {
    let trayImage = null;
    if (trayIconPath && fs.existsSync(trayIconPath)) {
      trayImage = nativeImage.createFromPath(trayIconPath);
    }
    if ((!trayImage || trayImage.isEmpty()) && iconPath && fs.existsSync(iconPath)) {
      trayImage = nativeImage.createFromPath(iconPath);
    }
    if (!trayImage || trayImage.isEmpty()) {
      trayImage = nativeImage.createEmpty();
    }

    if (!tray) {
      tray = new Tray(trayImage);
      tray.setToolTip('NOVA - Dynamic Island Companion');

      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'NOVA Dynamic Island',
          enabled: false,
        },
        { type: 'separator' },
        {
          label: 'Show / Toggle Island',
          accelerator: 'Alt+Shift+Space',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
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
            if (mainWindow && !mainWindow.isDestroyed()) {
              if (!mainWindow.isVisible()) {
                mainWindow.show();
              }
              mainWindow.focus();
              mainWindow.webContents.send('open-module', 'settings');
            }
          },
        },
        {
          label: 'Open RGB & Customization',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
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
        if (mainWindow && !mainWindow.isDestroyed()) {
          if (!mainWindow.isVisible()) {
            mainWindow.show();
          }
          mainWindow.focus();
          mainWindow.webContents.send('toggle-island');
        }
      });

      debugLog('System Tray created successfully and anchored to taskbar notification area.');
    }
  } catch (err) {
    debugLog('Failed to create system tray icon: ' + (err.stack || err.message));
  }

  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (process.argv.includes('--dev') && process.defaultApp) {
    mainWindow.loadURL('http://localhost:5173').catch((error) => dialog.showErrorBox('NOVA', error.message));
  } else {
    mainWindow.loadFile(indexPath).catch(() => dialog.showErrorBox('NOVA', 'Run npm run build before launching NOVA.'));
  }

  mainWindow.webContents.on('did-finish-load', () => {
    debugLog('Window contents finished loading successfully!');
    console.log('[NOVA] Window contents finished loading.');
    mainWindow.showInactive();
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    debugLog('Failed to load: ' + errorCode + ' ' + errorDescription);
    console.error('[NOVA] Failed to load:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('console-message', (event, level, message) => {
    const msg = typeof event === 'object' && event.message ? event.message : (message || event);
    debugLog(`[Renderer Console] ${msg}`);
  });

  // Window is ready and visible

  let islandState = { width: 268, height: 38, enableRoaming: true };
  const moveIsland = () => {
    const { enableRoaming, expanded, isAiWhisperOpen } = islandState;
    const display = !enableRoaming
      ? screen.getPrimaryDisplay()
      : expanded || isAiWhisperOpen
        ? screen.getDisplayMatching(mainWindow.getBounds())
        : screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    const bounds = calculateIslandBounds(display.workArea, islandState);
    const current = mainWindow.getBounds();
    if (Object.keys(bounds).some((key) => bounds[key] !== current[key])) mainWindow.setBounds(bounds);
  };
  on('set-island-state', (_event, state) => {
    if (!state || typeof state !== 'object') return;
    islandState = state;
    moveIsland();
  });
  let ignoringMouse = true;
  on('set-island-hit', (_event, interactive) => {
    if (typeof interactive !== 'boolean' || ignoringMouse === !interactive) return;
    ignoringMouse = !interactive;
    mainWindow.setIgnoreMouseEvents(ignoringMouse, { forward: true });
  });
  let lastDisplayId;
  const roamingTimer = setInterval(() => {
    const current = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).id;
    if (current === lastDisplayId) return;
    lastDisplayId = current;
    moveIsland();
  }, 750);
  let windowFocused = false;
  mainWindow.on('blur', () => {
    windowFocused = false;
    send('window-blurred');
  });
  mainWindow.on('focus', () => {
    windowFocused = true;
    send('window-focused');
  });

  // Real-Time System Media & YouTube playback monitoring
  let lastMediaRaw = '';
  let mediaPending = false;

  function pollMedia() {
    if (!mainWindow || mainWindow.isDestroyed() || mediaPending) return;

    let scriptPath = path.join(__dirname, 'scripts', 'get-media.ps1');
    if (!fs.existsSync(scriptPath)) {
      scriptPath = path.join(__dirname, '..', 'scripts', 'get-media.ps1');
    }
    if (!fs.existsSync(scriptPath)) return;

    mediaPending = true;
    execFile(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath],
      { timeout: 2500, windowsHide: true },
      (err, stdout) => {
        mediaPending = false;
        if (err || !stdout) return;
        try {
          const raw = stdout.trim();
          if (raw && raw !== lastMediaRaw) {
            const data = JSON.parse(raw);
            lastMediaRaw = raw;
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

  handle('get-media-status', () => {
    try {
      if (lastMediaRaw) return JSON.parse(lastMediaRaw);
    } catch (e) {}
    return { title: '', artist: '', album: '', isPlaying: false, status: 'Closed' };
  });

  // IPC media playback controls (Windows SMTC & Keystroke fallback)
  on('control-media', (_event, action) => {
    if (!['toggle', 'play', 'pause', 'next', 'prev'].includes(action)) return;
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

  let foregroundRequest;
  let foreground = { isDesktop: true, process: 'desktop' };
  const getActiveApp = () => {
    if (!foregroundRequest) {
      foregroundRequest = execFileAsync('powershell.exe', [
        '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(__dirname, 'scripts', 'get-active-app.ps1'),
      ], { windowsHide: true, timeout: 3500 }).then(({ stdout }) => {
        const { isDesktop, process } = JSON.parse(stdout);
        if (typeof isDesktop === 'boolean') {
          if (isDesktop !== foreground.isDesktop) send('foreground-app-changed', { isDesktop });
          foreground = { isDesktop, process };
        }
        return foreground;
      }).catch(() => foreground).finally(() => { foregroundRequest = null; });
    }
    return foregroundRequest;
  };
  handle('get-active-app', () => windowFocused ? { isDesktop: true } : getActiveApp());
  let currentDay = new Date().toDateString();
  let lastSampleAt = Date.now();
  let idleMs = 0;
  const appTimes = new Map();
  const foregroundTimer = setInterval(async () => {
    const now = Date.now();
    const day = new Date(now).toDateString();
    if (day !== currentDay) {
      currentDay = day;
      idleMs = 0;
      appTimes.clear();
      lastSampleAt = now;
    }
    const elapsed = Math.min(3000, Math.max(0, now - lastSampleAt));
    lastSampleAt = now;
    if (powerMonitor.getSystemIdleTime() >= 60) {
      idleMs += elapsed;
      return;
    }
    const active = windowFocused ? { process: 'NOVA' } : await getActiveApp();
    if (!active.process || active.process === 'desktop') return;
    appTimes.set(active.process, (appTimes.get(active.process) || 0) + elapsed);
  }, 2000);

  // Live Chrome / Edge / Browser Download Radar
  try {
    const downloadsDir = path.join(require('os').homedir(), 'Downloads');
    if (fs.existsSync(downloadsDir)) {
      let downloadCheckTimer = null;
      const watcher = fs.watch(downloadsDir, (eventType, filename) => {
        if (!filename) return;
        if (filename.endsWith('.crdownload') || filename.endsWith('.part')) {
          if (downloadCheckTimer) clearTimeout(downloadCheckTimer);
          downloadCheckTimer = setTimeout(() => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              try {
                const fullP = path.join(downloadsDir, filename);
                if (fs.existsSync(fullP)) {
                  const stat = fs.statSync(fullP);
                  const cleanName = filename.replace(/\.(crdownload|part|tmp)$/i, '');
                  mainWindow.webContents.send('download-status-update', {
                    active: true,
                    filename: cleanName,
                    sizeBytes: stat.size,
                    sizeFormatted: (stat.size / (1024 * 1024)).toFixed(1) + ' MB',
                  });
                } else {
                  // File completed downloading!
                  const cleanName = filename.replace(/\.(crdownload|part|tmp)$/i, '');
                  mainWindow.webContents.send('download-status-update', {
                    active: false,
                    completed: fs.existsSync(path.join(downloadsDir, cleanName)),
                    filename: cleanName,
                  });
                }
              } catch (e) {}
            }
          }, 350);
        }
      });
      watcher.on('error', (error) => debugLog('Downloads watcher: ' + error.message));
      mainWindow.once('closed', () => { clearTimeout(downloadCheckTimer); watcher.close(); });
    }
  } catch (err) {
    debugLog('Downloads watcher note: ' + err.message);
  }

  // VS Code & Terminal Build Status Watcher
  try {
    let lastBuildState = 'idle';
    const checkBuildProcesses = () => {
      if (!mainWindow || mainWindow.isDestroyed()) return;
      execFile('powershell.exe', ['-NoProfile', '-Command',
        '@(Get-Process -Name "tsc", "vite", "esbuild", "rustc", "cargo", "webpack" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty ProcessName) -join ","'
      ], { timeout: 2000, windowsHide: true }, (err, stdout) => {
        if (err) return;
        const procs = stdout ? stdout.trim() : '';
        const isBuilding = procs.length > 0;
        const newState = isBuilding ? 'building' : 'idle';
        if (newState !== lastBuildState) {
          lastBuildState = newState;
          send('build-status-changed', {
            state: isBuilding ? 'building' : 'idle',
            tool: procs ? procs.split(',')[0] : 'compiler',
            timestamp: Date.now(),
          });
        }
      });
    };
    const timer = setInterval(checkBuildProcesses, 5000);
    mainWindow.once('closed', () => clearInterval(timer));
  } catch (e) {}

  handle('get-screen-time', () => {
    const total = [...appTimes.values()].reduce((sum, value) => sum + value, 0);
    const duration = (ms) => {
      const minutes = Math.floor(ms / 60000);
      return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : minutes > 0 ? `${minutes}m` : '<1m';
    };
    return {
      totalScreenTime: total ? duration(total) : '0m',
      focusPercent: total + idleMs ? Math.round(total / (total + idleMs) * 100) : 0,
      idleMinutes: Math.floor(idleMs / 60000),
      apps: [...appTimes.entries()].sort((a, b) => b[1] - a[1]).map(([name, time]) => ({
        name,
        duration: duration(time),
        percent: Math.round(time / total * 100),
      })),
    };
  });

  // Real-Time System Metrics IPC & Background Broadcaster
  let latestSystemMetrics = null;
  let metricsPending = false;

  function pollSystemMetrics() {
    if (metricsPending) return;
    let scriptPath = path.join(__dirname, 'scripts', 'get-system-metrics.ps1');
    if (!fs.existsSync(scriptPath)) {
      scriptPath = path.join(__dirname, '..', 'scripts', 'get-system-metrics.ps1');
    }
    if (!fs.existsSync(scriptPath)) return;

    metricsPending = true;
    execFile(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath],
      { timeout: 3500, windowsHide: true },
      (err, stdout) => {
        metricsPending = false;
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

  handle('get-system-metrics', () => latestSystemMetrics);

  // Real-Time Windows Clipboard Watcher
  let lastWatchedClipboardText = '';
  try {
    lastWatchedClipboardText = clipboard.readText();
  } catch (e) {}

  const clipboardTimer = setInterval(() => {
    try {
      const currentText = clipboard.readText();
      if (currentText === lastWatchedClipboardText) return;
      lastWatchedClipboardText = currentText;
      if (currentText.trim()) {
        send('clipboard-copy-detected', { textContent: currentText, timestamp: Date.now() });
        send('clipboard-alert-pulse');
      }
    } catch (e) {}
  }, 400);

  handle('get-current-clipboard-text', () => {
    try {
      return clipboard.readText();
    } catch (e) {
      return '';
    }
  });

  handle('write-clipboard-text', (event, text) => {
    try {
      clipboard.writeText(text);
      lastWatchedClipboardText = text;
      return true;
    } catch (e) {
      return false;
    }
  });

  // NOVA Drop is available only during an explicitly started receiving session.
  const dropDir = path.join(app.getPath('downloads'), 'NovaDrop');
  dropReceiver = createDropReceiver({
    directory: dropDir,
    onFile: (file) => send('drop-file-received', file),
    onSession: (session) => send('drop-session-changed', session),
  });
  handle('get-drop-info', () => dropReceiver.info());
  handle('start-drop', () => dropReceiver.start());
  handle('stop-drop', () => dropReceiver.stop());
  handle('get-dropped-files', () => dropReceiver.list());
  handle('open-drop-folder', async () => {
    await fs.promises.mkdir(dropDir, { recursive: true });
    const error = await shell.openPath(dropDir);
    return { success: !error, error };
  });

  handle('get-wallpaper-palette', () => {
    const value = systemPreferences.getAccentColor();
    const accent = /^[a-f0-9]{8}$/i.test(value) ? `#${value.slice(0, 6)}` : '#38BDF8';
    return { accent, glow: `${accent}40`, tint: `${accent}18` };
  });

  const loginItem = {
    path: process.execPath,
    args: process.defaultApp ? [__filename, '--autostart'] : ['--autostart'],
  };
  handle('get-autostart-status', () => app.getLoginItemSettings(loginItem).openAtLogin);
  handle('set-autostart-status', (_event, enable) => {
    if (typeof enable !== 'boolean') throw new Error('Invalid startup preference');
    app.setLoginItemSettings({ ...loginItem, openAtLogin: enable });
    return app.getLoginItemSettings(loginItem).openAtLogin;
  });

  const settingsActions = {
    'open-wifi': 'ms-availablenetworks:',
    'open-bluetooth': 'ms-settings:bluetooth',
    'open-nightlight': 'ms-settings:nightlight',
    'open-display-settings': 'ms-settings:display',
    'open-sound-settings': 'ms-settings:sound',
    'open-windows-settings': 'ms-settings:',
    'open-snipping-tool': 'ms-screenclip:',
  };
  const systemActions = {
    'open-task-manager': ['taskmgr.exe', []],
    'open-calc': ['calc.exe', []],
    'lock-workstation': ['rundll32.exe', ['user32.dll,LockWorkStation']],
  };
  const volumeActions = { 'volume-mute': 173, 'volume-up': 175, 'volume-down': 174 };
  const launchProgram = (file, args) => new Promise((resolve, reject) => {
    const child = spawn(file, args, { windowsHide: true, stdio: 'ignore' });
    child.once('spawn', resolve);
    child.once('error', reject);
    child.unref();
  });
  handle('quick-action', async (_event, action) => {
    try {
      if (Object.hasOwn(settingsActions, action)) {
        await shell.openExternal(settingsActions[action]);
      } else if (Object.hasOwn(systemActions, action)) {
        const [file, args] = systemActions[action];
        await launchProgram(file, args);
      } else if (Object.hasOwn(volumeActions, action)) {
        await execFileAsync('powershell.exe', [
          '-NoProfile', '-Command',
          `(New-Object -ComObject WScript.Shell).SendKeys([char]${volumeActions[action]})`,
        ], { windowsHide: true, timeout: 4000 });
      } else if (action === 'brightness-up' || action === 'brightness-down') {
        const delta = action === 'brightness-up' ? '10' : '-10';
        const { stdout } = await execFileAsync('powershell.exe', [
          '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(__dirname, 'scripts', 'set-brightness.ps1'), delta,
        ], { windowsHide: true, timeout: 6000 }).catch(() => { throw new Error('Brightness control is unavailable for this display.'); });
        return { success: true, message: `Brightness set to ${stdout.trim()}%` };
      } else {
        return { success: false, error: 'Unknown Windows action' };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  const openLocalPath = async (targetPath) => {
    if (typeof targetPath !== 'string' || !path.isAbsolute(targetPath)) {
      return { success: false, error: 'Choose a full Windows file or folder path' };
    }
    const error = await shell.openPath(targetPath);
    return error ? { success: false, error } : { success: true };
  };
  handle('open-path', (_event, targetPath) => openLocalPath(targetPath));
  handle('launch-shortcut', async (_event, target) => {
    if (typeof target !== 'string' || !target.trim()) return { success: false, error: 'Enter a shortcut target' };
    const trimmed = target.trim();
    try {
      if (path.isAbsolute(trimmed)) return { ...await openLocalPath(trimmed), type: 'path' };
      if (/^https?:\/\//i.test(trimmed) || /^(ms-settings:|ms-windows-store:|spotify:)[a-z0-9/:?&=._-]*$/i.test(trimmed)) {
        await shell.openExternal(trimmed);
        return { success: true, type: 'url' };
      }
      if (!/^[\w.-]+\.exe$/i.test(trimmed)) return { success: false, error: 'Use a web link, executable name, or full Windows path' };
      await launchProgram(trimmed, []);
      return { success: true, type: 'command' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  handle('show-item-in-folder', (_event, targetPath) => {
    if (typeof targetPath !== 'string' || !path.isAbsolute(targetPath) || !fs.existsSync(targetPath)) {
      return { success: false, error: 'The file could not be found' };
    }
    shell.showItemInFolder(targetPath);
    return { success: true };
  });

  // Real cryptographic file hash calculator
  handle('compute-file-hash', async (event, { filePath, algorithm = 'sha256' }) => {
    const crypto = require('crypto');
    try {
      if (typeof filePath !== 'string' || !path.isAbsolute(filePath) || !['sha256', 'sha1', 'sha512'].includes(algorithm) || !fs.existsSync(filePath)) {
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

  on('focus-island-window', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
      mainWindow.focus();
    }
  });

  // Global hotkeys: Alt+Space & Ctrl+Space trigger AI Whisper & Quick Command Bar!
  const triggerAiWhisper = () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (!mainWindow.isVisible()) {
        mainWindow.show();
      }
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
      mainWindow.focus();
      mainWindow.webContents.send('toggle-ai-whisper');
    }
  };

  try {
    globalShortcut.register('Alt+Space', triggerAiWhisper);
  } catch (e) {
    debugLog('Alt+Space registration notice: ' + (e.message || e));
  }

  try {
    globalShortcut.register('CommandOrControl+Space', triggerAiWhisper);
  } catch (e) {
    debugLog('Ctrl+Space registration notice: ' + (e.message || e));
  }

  // Alt+Shift+Space toggles full island expand/collapse
  try {
    globalShortcut.register('Alt+Shift+Space', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        if (!mainWindow.isVisible()) mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('toggle-island');
      }
    });
  } catch (e) {}

  mainWindow.on('close', (e) => {
    debugLog('mainWindow on close called');
  });

  mainWindow.on('closed', () => {
    for (const timer of [roamingTimer, mediaInterval, metricsTimer, clipboardTimer, foregroundTimer]) clearInterval(timer);
    void dropReceiver?.stop();
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
    void dropReceiver?.stop();
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
    app.quit();
  }
});
