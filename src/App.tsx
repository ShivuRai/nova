import React, { useEffect } from 'react';
import { IslandContainer } from './components/island/IslandContainer';
import { useSystemStore } from './stores/useSystemStore';
import { useClipboardStore } from './stores/useClipboardStore';
import { MotionConfig } from 'framer-motion';

export const App: React.FC = () => {
  const updateMetrics = useSystemStore((state) => state.updateMetrics);
  const updateMedia = useSystemStore((state) => state.updateMedia);
  const capture = useClipboardStore((state) => state.capture);

  useEffect(() => {
    const ipc = window.novaDesktop;
    let cancelled = false;
    const applyMetrics = (data: Parameters<typeof updateMetrics>[0] | null) => {
      if (data && !cancelled) updateMetrics(data);
    };
    const applyMedia = (data: Parameters<typeof updateMedia>[0] | null) => {
      if (!data || cancelled) return;
      updateMedia({ title: data.title || '', artist: data.artist || '', album: data.album || '', isPlaying: Boolean(data.isPlaying) });
    };

    if (ipc) {
      ipc.invoke('get-system-metrics').then(applyMetrics).catch(() => {});
      ipc.invoke('get-media-status').then(applyMedia).catch(() => {});
      const stopMetrics = ipc.on('system-metrics-update', (_event, data) => applyMetrics(data));
      const stopMedia = ipc.on('media-status-update', (_event, data) => applyMedia(data));
      const stopClipboard = ipc.on('clipboard-copy-detected', (_event, data) => {
        if (typeof data?.textContent === 'string') capture(data.textContent, data.timestamp);
      });
      return () => { cancelled = true; stopMetrics(); stopMedia(); stopClipboard(); };
    }

    if ('__TAURI_INTERNALS__' in window) {
      const poll = async () => {
        try {
          const { invoke } = await import('@tauri-apps/api/core');
          applyMetrics(await invoke('get_system_metrics'));
        } catch {}
      };
      void poll();
      const interval = window.setInterval(poll, 2000);
      return () => { cancelled = true; window.clearInterval(interval); };
    }
  }, [updateMetrics, updateMedia, capture]);

  return (
    <MotionConfig reducedMotion="user">
      <main><IslandContainer /></main>
    </MotionConfig>
  );
};
export default App;
