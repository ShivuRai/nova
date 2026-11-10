export type ModuleCategory = 'everyday' | 'files' | 'time' | 'desktop' | 'specialist';

export interface NovaModule {
  id: string;
  name: string;
  category: ModuleCategory;
  iconName: string;
  version: string;
  enabledByDefault: boolean;
  permissions: string[];
  description: string;
}

export interface SystemMetrics {
  cpuUsagePercent: number;
  cpuTempCelsius?: number;
  ramUsagePercent: number;
  ramUsedGb: number;
  ramTotalGb: number;
  diskUsagePercent: number;
  diskFreeGb: number;
  networkDownloadKbps: number;
  networkUploadKbps: number;
  batteryPercent: number;
  isCharging: boolean;
  gpuUsagePercent?: number;
}

export interface MediaState {
  title: string;
  artist: string;
  album?: string;
  isPlaying: boolean;
  progressPercent: number;
  durationSeconds: number;
}

export type ActivityPriority = 'critical' | 'transfer' | 'timer' | 'music' | 'volume' | 'clipboard' | 'message';

export interface LiveActivity {
  id: string;
  type: ActivityPriority;
  title: string;
  subtitle?: string;
  icon: string;
  progress?: number; // 0-100
  timeoutMs?: number;
  createdAt: number;
}

export interface ClipboardItem {
  id: string;
  contentType: 'text' | 'image' | 'file';
  textContent: string;
  previewUrl?: string;
  sourceApp?: string;
  charCount: number;
  isPinned: boolean;
  createdAt: number;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  color?: string;
  isPinned: boolean;
  checklists?: Array<{ id: string; text: string; done: boolean }>;
  createdAt: number;
  updatedAt: number;
}

export interface ShelfItem {
  id: string;
  shelfId: string;
  fileName: string;
  originalPath: string;
  managedPath: string;
  fileSize: number;
  mimeType?: string;
  createdAt: number;
}

export interface TimerState {
  type: 'pomodoro' | 'countdown' | 'stopwatch';
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
}

export type ThemeMode =
  | 'minimal'
  | 'rgb'
  | 'light'
  | 'aurora'
  | 'cyberpunk'
  | 'deep-space'
  | 'sunset'
  | 'vivid';

export type NotchStyle =
  | 'floating-pill'
  | 'notch-attached'
  | 'squircle-bar'
  | 'compact-badge'
  | 'chamfered-notch'
  | 'dynamic-wing'
  | 'teardrop-capsule'
  | 'hex-pill';

export type ScreenPosition =
  | 'top-center'
  | 'top-left'
  | 'top-right'
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right';

export type RgbPreset = 'rainbow' | 'cyberpunk' | 'sunset' | 'oceanic' | 'aurora';

export type EdgeLightingMode =
  | 'corners-inward'
  | 'continuous'
  | 'center-outward'
  | 'breathing-glow'
  | 'off';

export type EdgeLightingColor =
  | 'cyan-pulse'
  | 'emerald-beam'
  | 'sunset-flare'
  | 'violet-aurora'
  | 'pure-white'
  | 'chromatic';

export type EdgeLightingSpeed = 'slow' | 'normal' | 'fast';

export type PillDisplayContent =
  | 'smart-auto'
  | 'media-priority'
  | 'telemetry'
  | 'clock-weather'
  | 'network-speed'
  | 'minimal-zen';

export interface AppearanceSettings {
  themeMode: ThemeMode;
  notchStyle: NotchStyle;
  screenPosition: ScreenPosition;
  enableRgbBorder: boolean;
  enableGlow: boolean;
  rgbPreset?: RgbPreset;
  edgeLightingMode?: EdgeLightingMode;
  edgeLightingColor?: EdgeLightingColor;
  edgeLightingSpeed?: EdgeLightingSpeed;
  pillDisplayContent?: PillDisplayContent;
  topOffset?: number;
  sideMargin?: number;
  customAccentColor?: string;
  customBgColor?: string;
  glassmorphismBlur?: number;
  glassmorphismOpacity?: number;
  glassmorphismBorderGlow?: number;
  pillWidth: number;
  pillHeight: number;
  expandedWidth: number;
  expandedHeight: number;
  hoverDelayMs: number;
  collapseDelayMs: number;
}
