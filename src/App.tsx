import React, { useEffect } from 'react';
import { IslandContainer } from './components/island/IslandContainer';
import { useSystemStore } from './stores/useSystemStore';

export const App: React.FC = () => {
  const { updateMetrics, updateMedia } = useSystemStore();

  // Polling for live real-time system metrics and media playback from Electron or Tauri
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        const handleMetricsUpdate = (_event: any, data: any) => {
          if (data) updateMetrics(data);
        };
        const handleMediaUpdate = (_event: any, data: any) => {
          if (data && typeof data === 'object') {
            updateMedia({
              title: data.title || '',
              artist: data.artist || '',
              album: data.album || '',
              isPlaying: Boolean(data.isPlaying),
            });
          }
        };

        ipcRenderer.on('system-metrics-update', handleMetricsUpdate);
        ipcRenderer.on('media-status-update', handleMediaUpdate);

        // Fetch initial snapshots
        ipcRenderer.invoke('get-system-metrics').then((data: any) => {
          if (data) updateMetrics(data);
        }).catch(() => {});

        ipcRenderer.invoke('get-media-status').then((data: any) => {
          if (data) handleMediaUpdate(null, data);
        }).catch(() => {});

        return () => {
          ipcRenderer.removeListener('system-metrics-update', handleMetricsUpdate);
          ipcRenderer.removeListener('media-status-update', handleMediaUpdate);
        };
      } catch (e) {}
    } else if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      import('@tauri-apps/api/core').then(({ invoke }) => {
        const interval = setInterval(async () => {
          try {
            const res = await invoke<any>('get_system_metrics');
            if (res) updateMetrics(res);
          } catch (e) {}
        }, 2000);
        return () => clearInterval(interval);
      });
    }
  }, [updateMetrics, updateMedia]);

  return (
    <main
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <IslandContainer />
    </main>
  );
};
export default App;
