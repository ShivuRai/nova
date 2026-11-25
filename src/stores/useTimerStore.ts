import { create } from 'zustand';

export type TimerMode = 'pomodoro' | 'break' | 'stopwatch';

interface TimerStoreState {
  mode: TimerMode;
  secondsRemaining: number;
  totalSeconds: number;
  stopwatchSeconds: number;
  isRunning: boolean;
  setMode: (mode: TimerMode) => void;
  start: (duration?: number) => void;
  extend: (seconds: number) => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
}

const DEFAULT_SECONDS = { pomodoro: 25 * 60, break: 5 * 60, stopwatch: 0 };
let startedAt = 0;
let runningBase = 0;

export const useTimerStore = create<TimerStoreState>((set, get) => ({
  mode: 'pomodoro',
  secondsRemaining: DEFAULT_SECONDS.pomodoro,
  totalSeconds: DEFAULT_SECONDS.pomodoro,
  stopwatchSeconds: 0,
  isRunning: false,

  setMode: (mode) => set({
    mode,
    isRunning: false,
    secondsRemaining: DEFAULT_SECONDS[mode],
    totalSeconds: DEFAULT_SECONDS[mode],
    stopwatchSeconds: 0,
  }),

  start: (duration) => {
    const { isRunning, mode, secondsRemaining, stopwatchSeconds, totalSeconds } = get();
    if (isRunning && duration === undefined) return;
    startedAt = Date.now();
    if (mode === 'stopwatch') {
      runningBase = stopwatchSeconds;
      set({ isRunning: true });
      return;
    }
    const remaining = duration ?? (secondsRemaining || totalSeconds || DEFAULT_SECONDS[mode]);
    runningBase = remaining;
    set({ isRunning: true, secondsRemaining: remaining, totalSeconds: duration ?? totalSeconds });
  },

  extend: (seconds) => {
    get().tick();
    const { mode, secondsRemaining, totalSeconds, isRunning } = get();
    if (mode === 'stopwatch') return;
    if (isRunning) runningBase += seconds;
    set({ secondsRemaining: secondsRemaining + seconds, totalSeconds: totalSeconds + seconds });
  },

  pause: () => {
    get().tick();
    set({ isRunning: false });
  },

  reset: () => get().setMode(get().mode),

  tick: () => {
    const { mode, isRunning, secondsRemaining, stopwatchSeconds } = get();
    if (!isRunning) return;
    const elapsed = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    if (mode === 'stopwatch') {
      const value = runningBase + elapsed;
      if (value !== stopwatchSeconds) set({ stopwatchSeconds: value });
    } else {
      const remaining = Math.max(0, runningBase - elapsed);
      if (remaining !== secondsRemaining) set({ secondsRemaining: remaining, isRunning: remaining > 0 });
    }
  },
}));

if (typeof window !== 'undefined') window.setInterval(() => useTimerStore.getState().tick(), 250);
