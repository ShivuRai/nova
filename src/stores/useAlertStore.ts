import { create } from 'zustand';

export interface BuildStatus {
  state: 'idle' | 'building' | 'success' | 'failed';
  tool: string;
  timestamp?: number;
}

export interface DownloadStatus {
  active: boolean;
  completed?: boolean;
  filename: string;
  sizeFormatted?: string;
}

export interface BatteryStatus {
  level: number;
  isCharging: boolean;
  isLow: boolean;
}

interface AlertState {
  clipboardPulse: { active: boolean; preview: string } | null;
  calendarAlert: { active: boolean; title: string; minutesLeft: number } | null;
  batteryStatus: BatteryStatus | null;
  buildStatus: BuildStatus;
  downloadStatus: DownloadStatus | null;

  triggerClipboardPulse: (preview: string) => void;
  triggerCalendarAlert: (title: string, minutesLeft: number) => void;
  clearCalendarAlert: () => void;
  setBatteryStatus: (status: BatteryStatus) => void;
  setBuildStatus: (status: BuildStatus) => void;
  setDownloadStatus: (status: DownloadStatus | null) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  clipboardPulse: null,
  calendarAlert: null,
  batteryStatus: null,
  buildStatus: { state: 'idle', tool: 'compiler' },
  downloadStatus: null,

  triggerClipboardPulse: (preview: string) => {
    set({ clipboardPulse: { active: true, preview } });
    setTimeout(() => {
      set({ clipboardPulse: null });
    }, 1200);
  },

  triggerCalendarAlert: (title: string, minutesLeft: number) => {
    set({ calendarAlert: { active: true, title, minutesLeft } });
  },

  clearCalendarAlert: () => set({ calendarAlert: null }),

  setBatteryStatus: (status: BatteryStatus) => set({ batteryStatus: status }),

  setBuildStatus: (status: BuildStatus) => set({ buildStatus: status }),

  setDownloadStatus: (status: DownloadStatus | null) => set({ downloadStatus: status }),
}));

