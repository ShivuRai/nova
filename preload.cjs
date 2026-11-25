const { contextBridge, ipcRenderer, webUtils } = require('electron');

const requests = new Set([
  'get-active-app', 'get-autostart-status', 'set-autostart-status',
  'get-system-metrics', 'get-media-status', 'get-screen-time',
  'write-clipboard-text', 'get-current-clipboard-text', 'quick-action',
  'launch-shortcut', 'open-path', 'show-item-in-folder', 'compute-file-hash',
  'get-wallpaper-palette', 'get-drop-info', 'start-drop', 'stop-drop',
  'get-dropped-files', 'open-drop-folder',
]);
const commands = new Set(['set-island-state', 'focus-island-window', 'control-media', 'set-island-hit']);
const notifications = new Set([
  'bring-to-front', 'toggle-island', 'open-module', 'system-metrics-update',
  'media-status-update', 'foreground-app-changed', 'window-blurred', 'window-focused',
  'active-display-changed', 'download-status-update', 'build-status-changed',
  'clipboard-alert-pulse', 'clipboard-copy-detected', 'toggle-ai-whisper',
  'open-ai-whisper', 'drop-file-received', 'drop-session-changed',
]);

contextBridge.exposeInMainWorld('novaDesktop', {
  invoke(channel, ...args) {
    if (!requests.has(channel)) throw new Error('Unsupported NOVA request');
    return ipcRenderer.invoke(channel, ...args);
  },
  send(channel, ...args) {
    if (!commands.has(channel)) throw new Error('Unsupported NOVA command');
    ipcRenderer.send(channel, ...args);
  },
  on(channel, listener) {
    if (!notifications.has(channel)) throw new Error('Unsupported NOVA notification');
    const receive = (_event, ...args) => listener(null, ...args);
    ipcRenderer.on(channel, receive);
    return () => ipcRenderer.removeListener(channel, receive);
  },
  getFilePath: (file) => webUtils.getPathForFile(file),
});
