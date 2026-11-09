const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth } = primaryDisplay.workAreaSize;

  const islandWidth = 740;
  const islandHeight = 500;
  const x = Math.round((screenWidth - islandWidth) / 2);
  const y = 0;

  mainWindow = new BrowserWindow({
    width: islandWidth,
    height: islandHeight,
    x: x,
    y: y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false,
    },
  });

  // Load self-contained local build
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  mainWindow.loadFile(indexPath).catch(() => {
    mainWindow.loadURL('http://localhost:5173');
  });

  // Dynamic sizing IPC
  ipcMain.on('set-island-state', (event, { expanded, width, height }) => {
    if (mainWindow) {
      const curBounds = mainWindow.getBounds();
      const newX = Math.round((screenWidth - width) / 2);
      mainWindow.setBounds({
        x: newX,
        y: 0,
        width: Math.round(width),
        height: Math.round(height),
      });
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
