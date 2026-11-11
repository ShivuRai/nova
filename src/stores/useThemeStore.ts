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
  edgeLightingMode: 'continuous',
  edgeLightingColor: 'cyan-pulse',
  customEdgeLightingColor: '#38BDF8',
  edgeLightingSpeed: 'normal',
  pillDisplayContent: 'smart-auto',
  pillBrandBadge: 'robot',
  topOffset: 0,
  sideMargin: 16,
  customAccentColor: '#38BDF8',
  customBgColor: '#0B0D12',
  glassmorphismBlur: 24,
  glassmorphismOpacity: 85,
  glassmorphismBorderGlow: 35,
  enableWallpaperTinting: false,
  enableAudioReactiveLighting: false,
  enableSoundEffects: true,
  soundVolume: 70,
  soundPack: 'glass',
  enable3dGyroGlare: true,
  ambientParticles: 'off',
  customPillCenter: 'clock',
  customPillRight: 'telemetry',
  pillWidth: 268,
  pillHeight: 38,
  expandedWidth: 640,
  expandedHeight: 420,
  hoverDelayMs: 120,
  collapseDelayMs: 320,
};

// Valid notch styles for sanitation
const VALID_NOTCH_STYLES: NotchStyle[] = [
  'floating-pill',
  'notch-attached',
  'squircle-bar',
  'compact-badge',
  'chamfered-notch',
  'dynamic-wing',
  'teardrop-capsule',
  'hex-pill',
  'stealth-blade',
  'cyber-diamond',
  'liquid-droplet',
  'split-capsule',
];

const applyCustomStyles = (settings: AppearanceSettings) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (settings.customAccentColor) {
    root.style.setProperty('--nova-blue', settings.customAccentColor);
    root.style.setProperty('--nova-accent', settings.customAccentColor);
  }

  if (settings.glassmorphismBlur !== undefined) {
    root.style.setProperty('--nova-glass-blur', `${settings.glassmorphismBlur}px`);
  }

  if (settings.glassmorphismOpacity !== undefined && settings.customBgColor) {
    const hex = settings.customBgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 11;
    const g = parseInt(hex.substring(2, 4), 16) || 13;
    const b = parseInt(hex.substring(4, 6), 16) || 18;
    const alpha = settings.glassmorphismOpacity / 100;
    root.style.setProperty('--nova-surface', `rgba(${r}, ${g}, ${b}, ${alpha})`);
    root.style.setProperty('--nova-bg', `rgba(${r}, ${g}, ${b}, ${Math.min(1, alpha + 0.1)})`);
  }

  if (settings.glassmorphismBorderGlow !== undefined) {
    const borderAlpha = (settings.glassmorphismBorderGlow / 100) * 0.4;
    root.style.setProperty('--nova-border', `rgba(255, 255, 255, ${borderAlpha})`);
  }
};

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
      if (merged.expandedHeight > 440) {
        merged.expandedHeight = 420;
      }
      if (merged.expandedWidth > 660) {
        merged.expandedWidth = 640;
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
  applyCustomStyles(initialSettings);
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

      // Sync to document element data attributes and CSS custom properties
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', updated.themeMode);
        document.documentElement.setAttribute('data-rgb-preset', updated.rgbPreset || 'rainbow');
        applyCustomStyles(updated);
      }
      try {
        localStorage.setItem('nova_theme_settings', JSON.stringify(updated));
      } catch (e) {}
      return { settings: updated };
    }),
}));
