// Platform service for desktop runtime detection and system integration

export const isElectron = (): boolean => {
  return Boolean(getIpc());
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
  sideMargin: number = 16,
  isRetracted: boolean = false,
  enableRoaming: boolean = true,
  isAiWhisperOpen: boolean = false
): Promise<void> => {
  try {
    {
      const ipcRenderer = getIpc();
      if (ipcRenderer) {
        ipcRenderer.send('set-island-state', {
          expanded,
          width,
          height,
          position,
          notchStyle,
          topOffset,
          sideMargin,
          isRetracted,
          enableRoaming,
          isAiWhisperOpen,
        });
        return;
      }
    }
    if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('set_island_state', { expanded, width: Math.max(width, isAiWhisperOpen ? 400 : 0) + 16, height: Math.max(height + 16, isAiWhisperOpen ? 340 : 0) });
    }
  } catch (err) {
    // Silent fallback
  }
};

export const getAutoStartStatus = async (): Promise<boolean> => {
  const ipc = getIpc();
  return ipc ? await ipc.invoke('get-autostart-status').catch(() => false) : false;
};

export const setAutoStartStatus = async (enabled: boolean): Promise<boolean> => {
  const ipc = getIpc();
  if (!ipc) throw new Error('Windows startup settings are unavailable');
  return ipc.invoke('set-autostart-status', enabled);
};

export const getIpc = () => typeof window === 'undefined' ? null : window.novaDesktop ?? null;

export const getLocalFilePath = (file: File) => getIpc()?.getFilePath(file) || '';

export const copyText = async (text: string) => {
  const ipc = getIpc();
  if (ipc) return Boolean(await ipc.invoke('write-clipboard-text', text));
  if (!navigator.clipboard) return false;
  await navigator.clipboard.writeText(text);
  return true;
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
    window.open(target, '_blank', 'noopener,noreferrer');
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

export const getWallpaperPalette = async (): Promise<{ accent: string; glow: string; tint: string }> => {
  const ipc = getIpc();
  if (ipc) {
    try {
      return await ipc.invoke('get-wallpaper-palette');
    } catch (e) {}
  }
  return { accent: '#38BDF8', glow: 'rgba(56, 189, 248, 0.25)', tint: 'rgba(56, 189, 248, 0.08)' };
};



