const { app, BrowserWindow, screen, ipcMain, Tray, Menu, nativeImage, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let tray = null;

function createWindow() {
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

  mainWindow = new BrowserWindow({
    title: 'NOVA - Your desktop. Reimagined.',
    width: islandWidth,
    height: islandHeight,
    x: x,
    y: y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: false, // Make sure it appears in the taskbar!
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
    console.log('[NOVA] Window contents finished loading.');
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('[NOVA] Failed to load:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer Console] ${message}`);
  });

  // Tray Icon Setup (optional, wrapped in safe try/catch)
  try {
    let trayIconFile = path.join(__dirname, 'src-tauri', 'icons', '32x32.png');
    if (!fs.existsSync(trayIconFile)) {
      trayIconFile = path.join(__dirname, '..', 'src-tauri', 'icons', '32x32.png');
    }
    if (fs.existsSync(trayIconFile)) {
      const trayIcon = nativeImage.createFromPath(trayIconFile);
      tray = new Tray(trayIcon);
      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Show NOVA',
          click: () => {
            if (mainWindow) {
              mainWindow.show();
              mainWindow.focus();
            }
          },
        },
        {
          label: 'Toggle Expand/Collapse',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('toggle-island');
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Exit NOVA',
          click: () => {
            app.quit();
          },
        },
      ]);
      tray.setToolTip('NOVA - Desktop Companion');
      tray.setContextMenu(contextMenu);
      tray.on('click', () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      });
    }
  } catch (err) {
    console.warn('[NOVA] Status tray initialization skipped:', err.message);
  }

  // Dynamic sizing IPC
  ipcMain.on('set-island-state', (event, { expanded, width, height }) => {
    if (mainWindow) {
      const newX = Math.round((screenWidth - width) / 2);
      mainWindow.setBounds({
        x: newX,
        y: expanded ? 8 : 0,
        width: Math.round(width),
        height: Math.round(height),
      });
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

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('will-quit', () => {
  try {
    globalShortcut.unregisterAll();
  } catch (e) {}
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
