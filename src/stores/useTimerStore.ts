import { create } from 'zustand';

export type TimerMode = 'pomodoro' | 'break' | 'stopwatch';

interface TimerStoreState {
  mode: TimerMode;
  secondsRemaining: number;
  stopwatchSeconds: number;
  isRunning: boolean;
  setMode: (mode: TimerMode) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
}

const DEFAULT_POMODORO = 25 * 60;
const DEFAULT_BREAK = 5 * 60;

export const useTimerStore = create<TimerStoreState>((set, get) => ({
  mode: 'pomodoro',
  secondsRemaining: DEFAULT_POMODORO,
  stopwatchSeconds: 0,
  isRunning: false,

  setMode: (newMode) => {
    set({
      mode: newMode,
      isRunning: false,
      secondsRemaining: newMode === 'pomodoro' ? DEFAULT_POMODORO : newMode === 'break' ? DEFAULT_BREAK : 0,
      stopwatchSeconds: 0,
    });
  },

  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),

  reset: () => {
    const currentMode = get().mode;
    set({
      isRunning: false,
      secondsRemaining: currentMode === 'pomodoro' ? DEFAULT_POMODORO : currentMode === 'break' ? DEFAULT_BREAK : 0,
      stopwatchSeconds: 0,
    });
  },

  tick: () => {
    const { isRunning, mode, secondsRemaining, stopwatchSeconds } = get();
    if (!isRunning) return;

    if (mode === 'stopwatch') {
      set({ stopwatchSeconds: stopwatchSeconds + 1 });
    } else {
      if (secondsRemaining <= 1) {
        set({ secondsRemaining: 0, isRunning: false });
      } else {
        set({ secondsRemaining: secondsRemaining - 1 });
      }
    }
  },
}));

// Global background ticker: never stops when island collapses or switches views!
if (typeof window !== 'undefined') {
  setInterval(() => {
    useTimerStore.getState().tick();
  }, 1000);
}

