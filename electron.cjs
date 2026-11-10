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
    if (fs.existsSync(iconPath)) {
      trayIcon = nativeImage.createFromPath(iconPath);
    } else {
      trayIcon = nativeImage.createEmpty();
    }

    if (!tray) {
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
    console.log('[NOVA] Window contents finished loading.');
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('[NOVA] Failed to load:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('console-message', (event) => {
    const msg = typeof event === 'object' && event.message ? event.message : event;
    console.log(`[Renderer Console] ${msg}`);
  });

  // Window is ready and visible

  // Dynamic sizing & positioning IPC
  ipcMain.on('set-island-state', (event, { expanded, width, height, position, notchStyle }) => {
    if (mainWindow) {
      const currentDisplay = screen.getPrimaryDisplay();
      const { width: screenWidth, height: screenHeight } = currentDisplay.workAreaSize;

      // Provide generous breathing room around the window so ambient glow and rounded corners are never clipped
      const padX = expanded ? 60 : 120;
      const padY = expanded ? 60 : 80;
      const winW = Math.round(width + padX);
      const winH = Math.round(height + padY);

      let targetX, targetY;
      const pos = position || 'top-center';
      const margin = 12;

      switch (pos) {
        case 'top-left':
          targetX = margin;
          targetY = notchStyle === 'notch-attached' ? 0 : margin;
          break;
        case 'top-right':
          targetX = screenWidth - winW - margin;
          targetY = notchStyle === 'notch-attached' ? 0 : margin;
          break;
        case 'bottom-center':
          targetX = Math.round((screenWidth - winW) / 2);
          targetY = screenHeight - winH;
          break;
        case 'bottom-left':
          targetX = margin;
          targetY = screenHeight - winH;
          break;
        case 'bottom-right':
          targetX = screenWidth - winW - margin;
          targetY = screenHeight - winH;
          break;
        case 'top-center':
        default:
          targetX = Math.round((screenWidth - winW) / 2);
          targetY = notchStyle === 'notch-attached' ? 0 : 8;
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
  if (tray) {
    try {
      tray.destroy();
    } catch (e) {}
    tray = null;
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.exit(0);
  }
});
