import { create } from 'zustand';
import { SystemMetrics, MediaState } from '../types';

interface SystemState {
  metrics: SystemMetrics;
  hasMetrics: boolean;
  media: MediaState;
  updateMetrics: (partial: Partial<SystemMetrics>) => void;
  updateMedia: (partial: Partial<MediaState>) => void;
}

const DEFAULT_METRICS: SystemMetrics = {
  cpuUsagePercent: 0,
  ramUsagePercent: 0,
  ramUsedGb: 0,
  ramTotalGb: 0,
  diskUsagePercent: 0,
  diskFreeGb: 0,
  networkDownloadKbps: 0,
  networkUploadKbps: 0,
  batteryPercent: 0,
  isCharging: false,
};

const DEFAULT_MEDIA: MediaState = {
  title: '',
  artist: '',
  album: '',
  isPlaying: false,
  progressPercent: 0,
  durationSeconds: 0,
};

export const useSystemStore = create<SystemState>((set) => ({
  metrics: DEFAULT_METRICS,
  hasMetrics: false,
  media: DEFAULT_MEDIA,
  updateMetrics: (partial) =>
    set((state) => ({ hasMetrics: true, metrics: { ...state.metrics, ...partial } })),
  updateMedia: (partial) =>
    set((state) => ({ media: { ...state.media, ...partial } })),
}));
