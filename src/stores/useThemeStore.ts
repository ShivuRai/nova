import { create } from 'zustand';
import { AppearanceSettings, ThemeMode, ScreenPosition, NotchStyle, RgbPreset } from '../types';

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
  rgbPreset: 'rainbow',
  pillWidth: 230,
  pillHeight: 38,
  expandedWidth: 680,
  expandedHeight: 500,
  hoverDelayMs: 120,
  collapseDelayMs: 320,
};

// Valid notch styles for sanitation
const VALID_NOTCH_STYLES: NotchStyle[] = ['floating-pill', 'notch-attached', 'squircle-bar', 'compact-badge'];

// Load saved settings if present
const getSavedSettings = (): AppearanceSettings => {
  try {
    const raw = localStorage.getItem('nova_theme_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      const merged = { ...DEFAULT_SETTINGS, ...parsed };
      // Sanitize RGB state to prevent lock-out
      if (!merged.enableRgbBorder && merged.themeMode === 'rgb') {
        merged.themeMode = 'minimal';
      }
      // Sanitize notch style
      if (!VALID_NOTCH_STYLES.includes(merged.notchStyle)) {
        merged.notchStyle = 'floating-pill';
      }
      return merged;
    }
  } catch (e) {}
  return DEFAULT_SETTINGS;
};

const initialSettings = getSavedSettings();
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', initialSettings.themeMode);
  document.documentElement.setAttribute('data-rgb-preset', initialSettings.rgbPreset || 'rainbow');
}

export const useThemeStore = create<ThemeState>((set) => ({
  settings: initialSettings,
  updateSettings: (partial) =>
    set((state) => {
      const updated = { ...state.settings, ...partial };

      // Ensure RGB state consistency - 100% bug-free toggle & disable
      if (partial.enableRgbBorder === false) {
        updated.enableRgbBorder = false;
        if (updated.themeMode === 'rgb') {
          updated.themeMode = 'minimal';
        }
      } else if (partial.enableRgbBorder === true) {
        updated.enableRgbBorder = true;
        updated.themeMode = 'rgb';
      }

      if (partial.themeMode) {
        if (partial.themeMode !== 'rgb') {
          updated.enableRgbBorder = false;
        } else {
          updated.enableRgbBorder = true;
        }
      }

      // Sync to document element data attributes
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', updated.themeMode);
        document.documentElement.setAttribute('data-rgb-preset', updated.rgbPreset || 'rainbow');
      }
      try {
        localStorage.setItem('nova_theme_settings', JSON.stringify(updated));
      } catch (e) {}
      return { settings: updated };
    }),
}));
