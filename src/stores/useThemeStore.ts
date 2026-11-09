import { create } from 'zustand';
import { AppearanceSettings } from '../types';

interface ThemeState {
  settings: AppearanceSettings;
  updateSettings: (partial: Partial<AppearanceSettings>) => void;
}

const DEFAULT_SETTINGS: AppearanceSettings = {
  themeMode: 'minimal',
  notchStyle: 'floating-pill',
  enableRgbBorder: false,
  enableGlow: true,
  pillWidth: 190,
  pillHeight: 34,
  expandedWidth: 640,
  expandedHeight: 460,
  hoverDelayMs: 120,
  collapseDelayMs: 320,
};

export const useThemeStore = create<ThemeState>((set) => ({
  settings: DEFAULT_SETTINGS,
  updateSettings: (partial) =>
    set((state) => {
      const updated = { ...state.settings, ...partial };
      // Sync to document element data-theme attribute
      document.documentElement.setAttribute('data-theme', updated.themeMode);
      return { settings: updated };
    }),
}));
