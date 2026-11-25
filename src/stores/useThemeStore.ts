import { create } from 'zustand';
import { AppearanceSettings, ThemeMode, ScreenPosition, NotchStyle, RgbPreset } from '../types';

interface ThemeState {
  settings: AppearanceSettings;
  updateSettings: (partial: Partial<AppearanceSettings>) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: AppearanceSettings = {
  themeMode: 'minimal',
  notchStyle: 'floating-pill',
  screenPosition: 'top-center',
  enableRgbBorder: false,
  enableGlow: true,
  rgbPreset: 'rainbow',
  edgeLightingMode: 'off',
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
  enable3dGyroGlare: false,
  ambientParticles: 'off',
  customNotchChamfer: 14,
  customNotchRadius: 12,
  customNotchWingDepth: 0,
  enableAutoRetract: true,
  autoRetractDelaySec: 4,
  wakeHoverDelayMs: 650,
  retractOnlyOnApps: true,
  enableMultiMonitorRoaming: true,
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
  'custom-shape',
];

const applyCustomStyles = (settings: AppearanceSettings) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  const accent = settings.customAccentColor;
  const background = settings.customBgColor;
  const customAccent = accent && accent.toUpperCase() !== DEFAULT_SETTINGS.customAccentColor && /^#[0-9a-f]{6}$/i.test(accent);
  if (customAccent) root.style.setProperty('--nova-blue', accent);
  else root.style.removeProperty('--nova-blue');

  root.style.setProperty('--nova-glass-blur', `${settings.glassmorphismBlur ?? 24}px`);
  const customBackground = background && background.toUpperCase() !== DEFAULT_SETTINGS.customBgColor && /^#[0-9a-f]{6}$/i.test(background);
  const opacity = Math.min(100, Math.max(25, settings.glassmorphismOpacity ?? 85));
  if (customBackground) root.style.setProperty('--nova-background', background);
  else root.style.removeProperty('--nova-background');
  if (customBackground || opacity !== 85) {
    root.style.setProperty('--nova-surface-glass', `color-mix(in srgb, var(--nova-background) ${opacity}%, transparent)`);
    root.style.setProperty('--nova-pill-bg', `color-mix(in srgb, var(--nova-background) ${Math.min(100, opacity + 6)}%, transparent)`);
  } else {
    root.style.removeProperty('--nova-surface-glass');
    root.style.removeProperty('--nova-pill-bg');
  }

  if ((settings.glassmorphismBorderGlow ?? 35) !== 35) {
    const alpha = Math.min(100, Math.max(0, settings.glassmorphismBorderGlow ?? 35)) * 0.004;
    root.style.setProperty('--nova-border', settings.themeMode === 'light' ? `rgba(0, 0, 0, ${alpha})` : `rgba(255, 255, 255, ${alpha})`);
  } else {
    root.style.removeProperty('--nova-border');
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

export const useThemeStore = create<ThemeState>((set, get) => ({
  settings: initialSettings,
  resetSettings: () => get().updateSettings(DEFAULT_SETTINGS),
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
