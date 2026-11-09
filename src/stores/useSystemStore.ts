import { create } from 'zustand';
import { SystemMetrics, MediaState } from '../types';

interface SystemState {
  metrics: SystemMetrics;
  media: MediaState;
  updateMetrics: (partial: Partial<SystemMetrics>) => void;
  updateMedia: (partial: Partial<MediaState>) => void;
}

const DEFAULT_METRICS: SystemMetrics = {
  cpuUsagePercent: 12,
  cpuTempCelsius: 44,
  ramUsagePercent: 48,
  ramUsedGb: 7.6,
  ramTotalGb: 16.0,
  diskUsagePercent: 62,
  diskFreeGb: 182,
  networkDownloadKbps: 450,
  networkUploadKbps: 80,
  batteryPercent: 88,
  isCharging: true,
  gpuUsagePercent: 15,
};

const DEFAULT_MEDIA: MediaState = {
  title: 'Starboy',
  artist: 'The Weeknd, Daft Punk',
  album: 'Starboy',
  isPlaying: true,
  progressPercent: 42,
  durationSeconds: 230,
};

export const useSystemStore = create<SystemState>((set) => ({
  metrics: DEFAULT_METRICS,
  media: DEFAULT_MEDIA,
  updateMetrics: (partial) =>
    set((state) => ({ metrics: { ...state.metrics, ...partial } })),
  updateMedia: (partial) =>
    set((state) => ({ media: { ...state.media, ...partial } })),
}));
