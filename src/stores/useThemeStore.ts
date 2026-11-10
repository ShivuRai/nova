import { create } from 'zustand';
import { AppearanceSettings, ThemeMode, ScreenPosition, NotchStyle } from '../types';

interface ThemeState {
  settings: AppearanceSettings;
  updateSettings: (partial: Partial<AppearanceSettings>) => void;
}

const DEFAULT_SETTINGS: AppearanceSettings = {
  themeMode: 'minimal',
  notchStyle: 'floating-pill',
  screenPosition: 'top-center',
  enableRgbBorder: false,
  enableGlow: true,
  pillWidth: 230,
  pillHeight: 38,
  expandedWidth: 680,
  expandedHeight: 500,
  hoverDelayMs: 120,
  collapseDelayMs: 320,
};

// Load saved settings if present
const getSavedSettings = (): AppearanceSettings => {
  try {
    const raw = localStorage.getItem('nova_theme_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {}
  return DEFAULT_SETTINGS;
};

const initialSettings = getSavedSettings();
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', initialSettings.themeMode);
}

export const useThemeStore = create<ThemeState>((set) => ({
  settings: initialSettings,
  updateSettings: (partial) =>
    set((state) => {
      const updated = { ...state.settings, ...partial };
      // Sync to document element data-theme attribute
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', updated.themeMode);
      }
      try {
        localStorage.setItem('nova_theme_settings', JSON.stringify(updated));
      } catch (e) {}
      return { settings: updated };
    }),
}));
