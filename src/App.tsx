import React, { useEffect } from 'react';
import { IslandContainer } from './components/island/IslandContainer';
import { useSystemStore } from './stores/useSystemStore';

export const App: React.FC = () => {
  const { updateMetrics } = useSystemStore();

  // Polling for live system metrics if Tauri invoke is available or fallback ticker
  useEffect(() => {
    const fetchSystemMetrics = async () => {
      try {
        if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
          const { invoke } = await import('@tauri-apps/api/core');
          const res = await invoke<any>('get_system_metrics');
          if (res) updateMetrics(res);
        } else {
          // Subtle variance in dev preview mode
          updateMetrics({
            cpuUsagePercent: Math.min(100, Math.max(5, Math.floor(12 + (Math.random() * 8 - 4)))),
            networkDownloadKbps: Math.floor(350 + Math.random() * 120),
          });
        }
      } catch (e) {
        // Fallback
      }
    };

    const interval = setInterval(fetchSystemMetrics, 2000);
    return () => clearInterval(interval);
  }, [updateMetrics]);

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
