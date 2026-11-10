// Platform service for desktop runtime detection and system integration

export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).require;
};

export const isTauri = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

export const resizeDesktopWindow = async (
  expanded: boolean,
  width: number,
  height: number,
  position: string = 'top-center',
  notchStyle: string = 'floating-pill',
  topOffset: number = 0,
  sideMargin: number = 16
): Promise<void> => {
  try {
    if (isElectron()) {
      const { ipcRenderer } = (window as any).require('electron');
      if (ipcRenderer) {
        ipcRenderer.send('set-island-state', {
          expanded,
          width,
          height,
          position,
          notchStyle,
          topOffset,
          sideMargin,
        });
        return;
      }
    }
    if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('set_island_state', { expanded, width, height });
    }
  } catch (err) {
    // Silent fallback
  }
};

export const getAutoStartStatus = async (): Promise<boolean> => {
  try {
    if (isElectron()) {
      const { ipcRenderer } = (window as any).require('electron');
      if (ipcRenderer) {
        return await ipcRenderer.invoke('get-autostart-status');
      }
    }
  } catch (err) {
    // Fallback to localStorage
  }
  const stored = localStorage.getItem('nova_autostart_enabled');
  return stored === 'true';
};

export const setAutoStartStatus = async (enabled: boolean): Promise<boolean> => {
  try {
    localStorage.setItem('nova_autostart_enabled', String(enabled));
    if (isElectron()) {
      const { ipcRenderer } = (window as any).require('electron');
      if (ipcRenderer) {
        return await ipcRenderer.invoke('set-autostart-status', enabled);
      }
    }
    return enabled;
  } catch (err) {
    console.error('Failed to set autostart status:', err);
    return enabled;
  }
};

export const getIpc = () => {
  try {
    if (typeof window !== 'undefined') {
      if (window.electron?.ipcRenderer) return window.electron.ipcRenderer;
      if (window.require) {
        const { ipcRenderer } = window.require('electron');
        return ipcRenderer;
      }
    }
  } catch (e) {}
  return null;
};

export const runQuickAction = async (action: string) => {
  const ipc = getIpc();
  if (ipc) {
    return await ipc.invoke('quick-action', action);
  }
  return { success: false, error: 'IPC unavailable' };
};

export const runLaunchShortcut = async (target: string) => {
  const ipc = getIpc();
  if (ipc) {
    return await ipc.invoke('launch-shortcut', target);
  }
  if (/^https?:\/\//i.test(target)) {
    window.open(target, '_blank');
    return { success: true };
  }
  return { success: false, error: 'IPC unavailable' };
};

export const runOpenPath = async (targetPath: string) => {
  const ipc = getIpc();
  if (ipc) {
    return await ipc.invoke('open-path', targetPath);
  }
  return { success: false, error: 'IPC unavailable' };
};

export const runShowItemInFolder = async (targetPath: string) => {
  const ipc = getIpc();
  if (ipc) {
    return await ipc.invoke('show-item-in-folder', targetPath);
  }
  return { success: false, error: 'IPC unavailable' };
};

export const runComputeFileHash = async (filePath: string, algorithm = 'sha256') => {
  const ipc = getIpc();
  if (ipc) {
    return await ipc.invoke('compute-file-hash', { filePath, algorithm });
  }
  return { success: false, error: 'IPC unavailable' };
};


