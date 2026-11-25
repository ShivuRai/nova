import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIslandStore } from '../../stores/useIslandStore';
import { useSystemStore } from '../../stores/useSystemStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { useClipboardStore } from '../../stores/useClipboardStore';
import { useAlertStore } from '../../stores/useAlertStore';
import { resizeDesktopWindow, getWallpaperPalette } from '../../services/platformService';
import { IslandPillContent } from './IslandPill';
import { IslandExpandedContent } from './IslandExpanded';
import { AmbientParticles } from './AmbientParticles';
import { AiWhisperCommandBar } from './AiWhisperCommandBar';
import {
  playHoverSound,
  playClickSound,
  playExpandSound,
  playCollapseSound,
  playSound,
} from '../../services/soundService';

export const IslandContainer: React.FC = () => {
  const {
    isExpanded,
    setExpanded,
    isPinned,
    isInteracting,
    isRetracted,
    setRetracted,
    isAiWhisperOpen,
    setAiWhisperOpen,
    setActiveModule,
    liveActivity,
    activeModule,
  } = useIslandStore();
  const media = useSystemStore((state) => state.media);
  const { settings } = useThemeStore();
  const {
    clipboardPulse,
    calendarAlert,
    batteryStatus,
    setBatteryStatus,
    setBuildStatus,
    setDownloadStatus,
    triggerClipboardPulse,
  } = useAlertStore();

  const [wallpaperPalette, setWallpaperPalette] = useState<{ accent: string; glow: string; tint: string } | null>(null);
  const [glarePos, setGlarePos] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [pointerInside, setPointerInside] = useState(false);
  const [keepOpen, setKeepOpen] = useState(false);

  useEffect(() => {
    if (settings.enableWallpaperTinting) {
      getWallpaperPalette().then((pal) => {
        if (pal) setWallpaperPalette(pal);
      });
    } else {
      setWallpaperPalette(null);
    }
  }, [settings.enableWallpaperTinting]);

  const hoverTimerRef = useRef<number | null>(null);
  const collapseTimerRef = useRef<number | null>(null);
  const windowResizeTimerRef = useRef<number | null>(null);
  const wakeHoverTimerRef = useRef<number | null>(null);

  const MODULE_HEIGHTS: Record<string, number> = {
    home: 395,
    timers: 330,
    pet: 330,
    clock: 330,
    drop: 345,
    'screen-time': 345,
    notes: 350,
    clipboard: 345,
    shelf: 345,
    system: 360,
    launcher: 360,
    units: 360,
    converter: 355,
    calendar: 360,
    message: 360,
    'quick-settings': 390,
    'file-tools': 350,
    links: 350,
    analytics: 355,
    revenue: 355,
    weather: 385,
    rgb: 385,
    settings: 440,
    'ai-coding': 415,
  };

  const targetExpandedHeight = MODULE_HEIGHTS[activeModule] || 360;

  useEffect(() => {
    if (settings.enableAutoRetract === false || isPinned || isExpanded || isInteracting || isAiWhisperOpen || pointerInside || isRetracted ||
      (isDesktop && settings.retractOnlyOnApps !== false)) return;

    const timer = window.setTimeout(() => setRetracted(true), (settings.autoRetractDelaySec ?? 4) * 1000);
    return () => window.clearTimeout(timer);
  }, [isPinned, isExpanded, isInteracting, isAiWhisperOpen, pointerInside, isRetracted, isDesktop, settings.enableAutoRetract, settings.autoRetractDelaySec, settings.retractOnlyOnApps, setRetracted]);

  useEffect(() => {
    if (settings.enableAutoRetract === false || (isDesktop && settings.retractOnlyOnApps !== false)) setRetracted(false);
  }, [isDesktop, settings.enableAutoRetract, settings.retractOnlyOnApps, setRetracted]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const getBattery = (navigator as Navigator & {
      getBattery?: () => Promise<EventTarget & { level: number; charging: boolean }>;
    }).getBattery;
    getBattery?.call(navigator).then((battery) => {
      if (cancelled) return;
      const update = () => setBatteryStatus({
        level: Math.round(battery.level * 100),
        isCharging: battery.charging,
        isLow: battery.level <= 0.2 && !battery.charging,
      });
      update();
      battery.addEventListener('levelchange', update);
      battery.addEventListener('chargingchange', update);
      cleanup = () => {
        battery.removeEventListener('levelchange', update);
        battery.removeEventListener('chargingchange', update);
      };
    }).catch(() => {});
    return () => { cancelled = true; cleanup?.(); };
  }, [setBatteryStatus]);

  useEffect(() => {
    const ipcRenderer = window.novaDesktop;
    if (!ipcRenderer) return;
    let active = true;
    const openIsland = () => {
      setKeepOpen(true);
      setRetracted(false);
      setExpanded(true);
    };
    const handleToggle = () => {
      if (useIslandStore.getState().isExpanded) { setKeepOpen(false); setExpanded(false); }
      else openIsland();
    };
    const handleBringToFront = openIsland;
    const handleOpenModule = (_event: null, moduleId: string) => {
      setActiveModule(moduleId);
      openIsland();
    };
    const handleForegroundApp = (_event: null, data: { isDesktop: boolean }) => {
      if (active && typeof data?.isDesktop === 'boolean') setIsDesktop(data.isDesktop);
    };
    const handleToggleAiWhisper = () => {
      const next = !useIslandStore.getState().isAiWhisperOpen;
      if (next) setRetracted(false);
      setAiWhisperOpen(next);
    };
    const handleOpenAiWhisper = () => {
      setRetracted(false);
      setAiWhisperOpen(true);
    };

    const unsubscribers = [
      ipcRenderer.on('bring-to-front', handleBringToFront),
      ipcRenderer.on('toggle-island', handleToggle),
      ipcRenderer.on('open-module', handleOpenModule),
      ipcRenderer.on('foreground-app-changed', handleForegroundApp),
      ipcRenderer.on('window-blurred', () => {
        useIslandStore.getState().setInteracting(false);
        ipcRenderer.invoke('get-active-app').then((data) => handleForegroundApp(null, data)).catch(() => {});
      }),
      ipcRenderer.on('download-status-update', (_event, update) => {
        setDownloadStatus(update);
        if (update?.completed) playSound('action');
      }),
      ipcRenderer.on('drop-file-received', (_event, file) => {
        useIslandStore.getState().setLiveActivity({
          id: 'drop-' + file.timestamp, type: 'transfer', title: 'Received ' + file.fileName,
          icon: 'Check', createdAt: file.timestamp, timeoutMs: 6000,
        });
      }),
      ipcRenderer.on('build-status-changed', (_event, update) => setBuildStatus(update)),
      ipcRenderer.on('clipboard-alert-pulse', () => {
        if (useClipboardStore.getState().captureEnabled) triggerClipboardPulse('');
      }),
      ipcRenderer.on('toggle-ai-whisper', handleToggleAiWhisper),
      ipcRenderer.on('open-ai-whisper', handleOpenAiWhisper),
    ];
    ipcRenderer.invoke('get-active-app').then((data) => handleForegroundApp(null, data)).catch(() => {});
    return () => { active = false; unsubscribers.forEach((unsubscribe) => unsubscribe()); };
  }, [setActiveModule, setExpanded, setRetracted, setAiWhisperOpen, setDownloadStatus, setBuildStatus, triggerClipboardPulse]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const state = useIslandStore.getState();
      if (e.key === 'Escape') {
        if (state.isAiWhisperOpen) setAiWhisperOpen(false);
        else if (state.isExpanded) { setKeepOpen(false); setExpanded(false); }
      } else if (!window.novaDesktop && !e.repeat && (e.altKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault();
        if (!state.isAiWhisperOpen) setRetracted(false);
        setAiWhisperOpen(!state.isAiWhisperOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setExpanded, setRetracted, setAiWhisperOpen]);

  useEffect(() => () => {
    for (const timer of [hoverTimerRef, collapseTimerRef, wakeHoverTimerRef]) {
      if (timer.current !== null) window.clearTimeout(timer.current);
    }
  }, []);

  const setWindowHit = (hit: boolean) => {
    setPointerInside(hit);
    window.novaDesktop?.send('set-island-hit', hit);
  };

  const handleMouseEnter = () => {
    setWindowHit(true);
    setKeepOpen(false);
    if (collapseTimerRef.current !== null) window.clearTimeout(collapseTimerRef.current);
    if (isAiWhisperOpen || isExpanded) return;
    playHoverSound();
    if (isRetracted) {
      wakeHoverTimerRef.current = window.setTimeout(() => {
        playExpandSound();
        setRetracted(false);
        setExpanded(true);
      }, settings.wakeHoverDelayMs ?? 650);
    } else {
      hoverTimerRef.current = window.setTimeout(() => {
        playExpandSound();
        setExpanded(true);
      }, settings.hoverDelayMs);
    }
  };

  useEffect(() => {
    if (keepOpen || pointerInside || !isExpanded || isPinned || isInteracting || isAiWhisperOpen) return;
    if (collapseTimerRef.current !== null) window.clearTimeout(collapseTimerRef.current);
    collapseTimerRef.current = window.setTimeout(() => {
      playCollapseSound();
      setExpanded(false);
    }, settings.collapseDelayMs);
    return () => {
      if (collapseTimerRef.current !== null) window.clearTimeout(collapseTimerRef.current);
    };
  }, [keepOpen, pointerInside, isExpanded, isPinned, isInteracting, isAiWhisperOpen, settings.collapseDelayMs, setExpanded]);

  const handleMouseLeave = () => {
    setWindowHit(false);
    if (wakeHoverTimerRef.current !== null) window.clearTimeout(wakeHoverTimerRef.current);
    if (hoverTimerRef.current !== null) window.clearTimeout(hoverTimerRef.current);
  };

  const handleManualExpand = () => {
    if (hoverTimerRef.current !== null) window.clearTimeout(hoverTimerRef.current);
    if (wakeHoverTimerRef.current !== null) window.clearTimeout(wakeHoverTimerRef.current);
    playClickSound();
    playExpandSound();
    setRetracted(false);
    setExpanded(true);
  };

  const handleManualCollapse = () => {
    if (collapseTimerRef.current !== null) window.clearTimeout(collapseTimerRef.current);
    playClickSound();
    playCollapseSound();
    setKeepOpen(false);
    setExpanded(false);
  };

  useEffect(() => {
    if (!liveActivity?.timeoutMs) return;
    const timer = window.setTimeout(() => {
      if (useIslandStore.getState().liveActivity?.id === liveActivity.id) useIslandStore.getState().dismissLiveActivity();
    }, Math.max(0, liveActivity.createdAt + liveActivity.timeoutMs - Date.now()));
    return () => window.clearTimeout(timer);
  }, [liveActivity]);

  const isBottom = settings.screenPosition?.startsWith('bottom');
  const isLeft = settings.screenPosition?.endsWith('left');
  const isRight = settings.screenPosition?.endsWith('right');
  const isNotch =
    (settings.notchStyle === 'notch-attached' || settings.notchStyle === 'chamfered-notch') &&
    !isBottom;
  const isSquircle = settings.notchStyle === 'squircle-bar';
  const isCompact = settings.notchStyle === 'compact-badge';
  const isChamfered = settings.notchStyle === 'chamfered-notch';
  const isDynamicWing = settings.notchStyle === 'dynamic-wing';
  const isTeardrop = settings.notchStyle === 'teardrop-capsule';
  const isHexPill = settings.notchStyle === 'hex-pill';
  const isBlade = settings.notchStyle === 'stealth-blade';
  const isDiamond = settings.notchStyle === 'cyber-diamond';
  const isDroplet = settings.notchStyle === 'liquid-droplet';
  const isSplit = settings.notchStyle === 'split-capsule';
  const isCustomShape = settings.notchStyle === 'custom-shape';
  const isRgb = settings.enableRgbBorder || settings.themeMode === 'rgb';

  const customChamfer = Math.max(0, Math.min(28, isExpanded ? targetExpandedHeight / 3 : settings.pillHeight / 3, settings.customNotchChamfer ?? 14));
  const customWingDepth = Math.max(0, Math.min(24, settings.customNotchWingDepth ?? 0));
  const customRadiusVal = Math.max(0, Math.min(28, settings.customNotchRadius ?? 12));

  const effectivePillWidth = isCompact
    ? 170
    : liveActivity || media.isPlaying || (settings.pillDisplayContent === 'media-priority' && media.title)
    ? 270
    : settings.pillDisplayContent === 'telemetry'
    ? 260
    : Math.max(250, settings.pillWidth || 250);
  const effectivePillHeight = isCompact ? 32 : settings.pillHeight;

  const currentWidth = isExpanded ? settings.expandedWidth : isRetracted ? 135 : effectivePillWidth;
  const currentHeight = isExpanded ? targetExpandedHeight : isRetracted ? 8 : effectivePillHeight;

  useEffect(() => {
    const sync = () => resizeDesktopWindow(
      isExpanded, currentWidth, currentHeight, settings.screenPosition, settings.notchStyle,
      settings.topOffset ?? 0, settings.sideMargin ?? 16, isRetracted,
      settings.enableMultiMonitorRoaming !== false, isAiWhisperOpen
    );
    if (isExpanded || isRetracted || isAiWhisperOpen) {
      void sync();
      return;
    }
    windowResizeTimerRef.current = window.setTimeout(sync, 200);
    return () => {
      if (windowResizeTimerRef.current !== null) window.clearTimeout(windowResizeTimerRef.current);
    };
  }, [isExpanded, currentWidth, currentHeight, settings.screenPosition, settings.notchStyle, settings.topOffset, settings.sideMargin, settings.enableMultiMonitorRoaming, isRetracted, isAiWhisperOpen]);

  // Explicit radius per shape
  let currentRadius = '20px';
  if (isRetracted) {
    currentRadius = '0 0 8px 8px';
  } else if (isChamfered) {
    currentRadius = '0px';
  } else if (isCustomShape) {
    currentRadius = customChamfer > 0 || customWingDepth > 0 ? '0px' : (isExpanded ? '24px' : `${customRadiusVal}px`);
  } else if (isDynamicWing) {
    currentRadius = isExpanded ? '6px' : '4px';
  } else if (isNotch) {
    currentRadius = isExpanded ? '24px' : '0 0 20px 20px';
  } else if (isSquircle) {
    currentRadius = isExpanded ? '24px' : '14px';
  } else if (isCompact) {
    currentRadius = isExpanded ? '24px' : '16px';
  } else if (isTeardrop) {
    currentRadius = isExpanded ? '24px' : '22px 8px 22px 18px';
  } else if (isHexPill) {
    currentRadius = isExpanded ? '24px' : '0px';
  } else if (isBlade) {
    currentRadius = isExpanded ? '24px' : '0px';
  } else if (isDiamond) {
    currentRadius = isExpanded ? '24px' : '0px';
  } else if (isDroplet) {
    currentRadius = isExpanded ? '24px' : '24px 24px 24px 8px';
  } else if (isSplit) {
    currentRadius = isExpanded ? '24px' : '20px';
  } else {
    // Floating Pill: 20px when collapsed (perfect pill), 24px when expanded (crisp modern card)
    currentRadius = isExpanded ? '24px' : '20px';
  }

  let glowRadius = '24px';
  if (isRetracted) {
    glowRadius = '0 0 10px 10px';
  } else if (isChamfered || isNotch) {
    glowRadius = isExpanded ? '0 0 28px 28px' : '0 0 24px 24px';
  } else if (isCustomShape) {
    glowRadius = isExpanded ? '28px' : `${Math.max(16, customRadiusVal + 6)}px`;
  } else if (isDynamicWing) {
    glowRadius = isExpanded ? '20px' : '16px';
  } else if (isSquircle) {
    glowRadius = isExpanded ? '28px' : '18px';
  } else if (isCompact) {
    glowRadius = isExpanded ? '28px' : '20px';
  } else if (isTeardrop) {
    glowRadius = isExpanded ? '28px' : '24px 12px 24px 20px';
  } else if (isHexPill) {
    glowRadius = isExpanded ? '28px' : '16px';
  } else if (isBlade) {
    glowRadius = isExpanded ? '28px' : '20px 6px 20px 6px';
  } else if (isDiamond) {
    glowRadius = isExpanded ? '28px' : '10px 28px 10px 28px';
  } else if (isDroplet) {
    glowRadius = isExpanded ? '28px' : '28px 28px 28px 10px';
  } else if (isSplit) {
    glowRadius = isExpanded ? '28px' : '24px';
  } else {
    glowRadius = isExpanded ? '28px' : '24px';
  }

  const topGap = isRetracted ? 0 : (typeof settings.topOffset === 'number' ? settings.topOffset : (isNotch ? 0 : 8));
  const nativeInset = window.novaDesktop ? 0 : topGap;
  const sideGap = window.novaDesktop ? 8 : (settings.sideMargin ?? 16);

  // Explicit clip-path for faceted geometric notch shapes
  let currentClipPath = 'none';
  if (isRetracted) {
    currentClipPath = 'none';
  } else if (isCustomShape) {
    if (customWingDepth > 0) {
      currentClipPath = `polygon(${customChamfer}px 0%, calc(100% - ${customChamfer}px) 0%, 100% ${customChamfer}px, 100% 26%, calc(100% - ${customWingDepth}px) 50%, 100% 74%, 100% calc(100% - ${customChamfer}px), calc(100% - ${customChamfer}px) 100%, ${customChamfer}px 100%, 0% calc(100% - ${customChamfer}px), 0% 74%, ${customWingDepth}px 50%, 0% 26%, 0% ${customChamfer}px)`;
    } else if (customChamfer > 0) {
      currentClipPath = `polygon(${customChamfer}px 0%, calc(100% - ${customChamfer}px) 0%, 100% ${customChamfer}px, 100% calc(100% - ${customChamfer}px), calc(100% - ${customChamfer}px) 100%, ${customChamfer}px 100%, 0% calc(100% - ${customChamfer}px), 0% ${customChamfer}px)`;
    } else {
      currentClipPath = 'none';
    }
  } else if (isChamfered) {
    if (isExpanded) {
      currentClipPath = 'polygon(16px 0%, calc(100% - 16px) 0%, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0% calc(100% - 16px), 0% 16px)';
    } else if (!isBottom && topGap === 0) {
      currentClipPath = 'polygon(0% 0%, 100% 0%, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0% calc(100% - 16px))';
    } else {
      currentClipPath = 'polygon(14px 0%, calc(100% - 14px) 0%, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0% calc(100% - 14px), 0% 14px)';
    }
  } else if (isDynamicWing) {
    if (isExpanded) {
      currentClipPath = 'polygon(0% 16px, 16px 0%, calc(100% - 16px) 0%, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0% calc(100% - 16px))';
    } else {
      currentClipPath = 'polygon(16px 0%, calc(100% - 16px) 0%, 100% 26%, calc(100% - 8px) 50%, 100% 74%, calc(100% - 16px) 100%, 16px 100%, 0% 74%, 8px 50%, 0% 26%)';
    }
  } else if (!isExpanded) {
    if (isBlade) {
      currentClipPath = 'polygon(0% 0%, 100% 0%, calc(100% - 10px) 100%, 10px 100%)';
    } else if (isDiamond) {
      currentClipPath = 'polygon(12px 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0% 50%)';
    } else if (isHexPill) {
      currentClipPath = 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0% 50%)';
    }
  }

  const dynamicBg = wallpaperPalette && settings.enableWallpaperTinting
    ? `color-mix(in srgb, ${wallpaperPalette.accent} 14%, ${isExpanded ? 'var(--nova-surface-glass)' : 'var(--nova-pill-bg)'})`
    : (isExpanded ? 'var(--nova-surface-glass)' : 'var(--nova-pill-bg)');

  const dynamicGlow = wallpaperPalette && settings.enableWallpaperTinting
    ? wallpaperPalette.glow
    : 'var(--nova-glow-color)';

  const EDGE_GRADIENTS: Record<string, string> = {
    'cyan-pulse': 'linear-gradient(90deg, #38BDF8, #3B82F6, #60A5FA, #38BDF8)',
    'emerald-beam': 'linear-gradient(90deg, #10B981, #34D399, #06B6D4, #10B981)',
    'sunset-flare': 'linear-gradient(90deg, #F59E0B, #F43F5E, #EC4899, #F59E0B)',
    'violet-aurora': 'linear-gradient(90deg, #8B5CF6, #A855F7, #EC4899, #8B5CF6)',
    'pure-white': 'linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,255,255,0.25), rgba(255,255,255,0.95))',
    'chromatic': 'linear-gradient(90deg, #60A5FA, #A78BFA, #F43F5E, #38BDF8, #34D399, #60A5FA)',
  };

  const customEdgeColor = settings.customEdgeLightingColor || '#38BDF8';
  const isClipboardActive = clipboardPulse && clipboardPulse.active;
  const isCalendarActive = calendarAlert && calendarAlert.active;
  const isBatteryLow = batteryStatus && batteryStatus.isLow;
  const isPeripheralAlert = isClipboardActive || isCalendarActive || isBatteryLow;

  const resolvedEdgeBackground = isClipboardActive
    ? 'linear-gradient(90deg, #38BDF8, #00F0FF, #FFFFFF, #38BDF8)'
    : isCalendarActive
    ? 'linear-gradient(90deg, #F59E0B, #FBBF24, #EF4444, #F59E0B)'
    : isBatteryLow
    ? 'linear-gradient(90deg, #EF4444, #F97316, #EF4444)'
    : settings.edgeLightingColor === 'custom'
    ? `linear-gradient(90deg, ${customEdgeColor}, #ffffff, ${customEdgeColor})`
    : (EDGE_GRADIENTS[settings.edgeLightingColor || 'cyan-pulse'] || EDGE_GRADIENTS['cyan-pulse']);

  // Mathematically exact geometric outline path following the real notch shape
  const getShapePath = () => {
    const w = currentWidth;
    const h = currentHeight;
    const isAttachedToTop = !isBottom && topGap === 0 && !isExpanded;

    if (isCustomShape) {
      const c = customChamfer;
      const wd = customWingDepth;
      const r = customRadiusVal;

      if (wd > 0) {
        return `M ${c},0.75 L ${w - c},0.75 L ${w - 0.75},${c} L ${w - 0.75},${h * 0.26} L ${w - wd},${h * 0.5} L ${w - 0.75},${h * 0.74} L ${w - 0.75},${h - c} L ${w - c},${h - 0.75} L ${c},${h - 0.75} L 0.75,${h - c} L 0.75,${h * 0.74} L ${wd},${h * 0.5} L 0.75,${h * 0.26} L 0.75,${c} Z`;
      }
      if (c > 0) {
        return `M ${c},0.75 L ${w - c},0.75 L ${w - 0.75},${c} L ${w - 0.75},${h - c} L ${w - c},${h - 0.75} L ${c},${h - 0.75} L 0.75,${h - c} L 0.75,${c} Z`;
      }
      const cr = isExpanded ? 24 : Math.min(r, (h - 1.5) / 2);
      return `M ${cr + 0.75},0.75 L ${w - cr - 0.75},0.75 A ${cr} ${cr} 0 0 1 ${w - 0.75},${cr + 0.75} L ${w - 0.75},${h - cr - 0.75} A ${cr} ${cr} 0 0 1 ${w - cr - 0.75},${h - 0.75} L ${cr + 0.75},${h - 0.75} A ${cr} ${cr} 0 0 1 0.75,${h - cr - 0.75} L 0.75,${cr + 0.75} A ${cr} ${cr} 0 0 1 ${cr + 0.75},0.75 Z`;
    }

    if (isChamfered) {
      if (isAttachedToTop) {
        return `M 0.75,0 L ${w - 0.75},0 L ${w - 0.75},${h - 16} L ${w - 16},${h - 0.75} L 16,${h - 0.75} L 0.75,${h - 16} Z`;
      }
      return `M 14,0.75 L ${w - 14},0.75 L ${w - 0.75},14 L ${w - 0.75},${h - 14} L ${w - 14},${h - 0.75} L 14,${h - 0.75} L 0.75,${h - 14} L 0.75,14 Z`;
    }

    if (isDynamicWing) {
      if (isExpanded) {
        return `M 16,0.75 L ${w - 16},0.75 L ${w - 0.75},16 L ${w - 0.75},${h - 16} L ${w - 16},${h - 0.75} L 16,${h - 0.75} L 0.75,${h - 16} L 0.75,16 Z`;
      }
      return `M 16,0.75 L ${w - 16},0.75 L ${w - 0.75},${h * 0.26} L ${w - 8},${h * 0.5} L ${w - 0.75},${h * 0.74} L ${w - 16},${h - 0.75} L 16,${h - 0.75} L 0.75,${h * 0.74} L 8,${h * 0.5} L 0.75,${h * 0.26} Z`;
    }

    if (!isExpanded) {
      if (isBlade) {
        return `M 0.75,0.75 L ${w - 0.75},0.75 L ${w - 10},${h - 0.75} L 10,${h - 0.75} Z`;
      }
      if (isDiamond) {
        return `M 12,0.75 L ${w - 12},0.75 L ${w - 0.75},${h * 0.5} L ${w - 12},${h - 0.75} L 12,${h - 0.75} L 0.75,${h * 0.5} Z`;
      }
      if (isHexPill) {
        return `M 8,0.75 L ${w - 8},0.75 L ${w - 0.75},${h * 0.5} L ${w - 8},${h - 0.75} L 8,${h - 0.75} L 0.75,${h * 0.5} Z`;
      }
    }

    if (isNotch && isAttachedToTop) {
      const r = 20;
      return `M 0.75,0 L 0.75,${h - r} A ${r} ${r} 0 0 0 ${r + 0.75},${h - 0.75} L ${w - r - 0.75},${h - 0.75} A ${r} ${r} 0 0 0 ${w - 0.75},${h - r} L ${w - 0.75},0`;
    }

    if (isTeardrop && !isExpanded) {
      return `M 22,0.75 L ${w - 8},0.75 A 8 8 0 0 1 ${w - 0.75},8.75 L ${w - 0.75},${h - 18} A 18 18 0 0 1 ${w - 18},${h - 0.75} L 22,${h - 0.75} A 22 22 0 0 1 0.75,${h - 22} L 0.75,22 A 22 22 0 0 1 22,0.75 Z`;
    }

    if (isDroplet && !isExpanded) {
      return `M 24,0.75 L ${w - 24},0.75 A 24 24 0 0 1 ${w - 0.75},24.75 L ${w - 0.75},${h - 24} A 24 24 0 0 1 ${w - 24},${h - 0.75} L 8,${h - 0.75} A 8 8 0 0 1 0.75,${h - 8} L 0.75,24 A 24 24 0 0 1 24,0.75 Z`;
    }

    const rx = isExpanded ? 24 : isSquircle ? 14 : isCompact ? 16 : Math.min(20, (h - 1.5) / 2);
    return `M ${rx + 0.75},0.75 L ${w - rx - 0.75},0.75 A ${rx} ${rx} 0 0 1 ${w - 0.75},${rx + 0.75} L ${w - 0.75},${h - rx - 0.75} A ${rx} ${rx} 0 0 1 ${w - rx - 0.75},${h - 0.75} L ${rx + 0.75},${h - 0.75} A ${rx} ${rx} 0 0 1 0.75,${h - rx - 0.75} L 0.75,${rx + 0.75} A ${rx} ${rx} 0 0 1 ${rx + 0.75},0.75 Z`;
  };

  const edgeDuration =
    settings.edgeLightingSpeed === 'slow' ? 6.5 :
    settings.edgeLightingSpeed === 'fast' ? 1.5 :
    3.2;

  const shapePath = getShapePath();

  const justifyContent = isLeft ? 'flex-start' : isRight ? 'flex-end' : 'center';
  const alignItems = isBottom ? 'flex-end' : 'flex-start';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent,
        alignItems,
        width: '100vw',
        height: '100vh',
        paddingTop: !isBottom ? nativeInset : 0,
        paddingBottom: isBottom ? nativeInset : 0,
        paddingLeft: isLeft ? sideGap : 0,
        paddingRight: isRight ? sideGap : 0,
        pointerEvents: 'none', // pass through clicks on transparent canvas
      }}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '100%',
          maxHeight: '100%',
          pointerEvents: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: isBottom ? 'flex-end' : 'flex-start',
        }}
        onFocusCapture={() => useIslandStore.getState().setInteracting(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) useIslandStore.getState().setInteracting(false);
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Natural Ambient Glow Halo - Smoothly scales and feathers with capsule */}
        {settings.enableGlow && (
          <motion.div
            animate={{
              width: currentWidth + (isRetracted ? 14 : isNotch ? 40 : 32),
              height: currentHeight + (isRetracted ? 6 : isNotch ? 20 : 32),
              borderRadius: glowRadius,
            }}
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 32,
              mass: 0.8,
            }}
            style={{
              position: 'absolute',
              top: isRetracted || isNotch ? 0 : -8,
              background: isRgb
                ? 'radial-gradient(ellipse at center, rgba(96, 165, 250, 0.45) 0%, rgba(167, 139, 250, 0.28) 40%, rgba(244, 63, 94, 0.10) 65%, transparent 80%)'
                : isNotch || isRetracted
                ? 'radial-gradient(ellipse at 50% 0%, var(--nova-glow-color) 0%, rgba(var(--nova-glow-rgb), 0.22) 40%, rgba(var(--nova-glow-rgb), 0.05) 65%, transparent 80%)'
                : 'radial-gradient(ellipse at center, var(--nova-glow-color) 0%, rgba(var(--nova-glow-rgb), 0.22) 40%, rgba(var(--nova-glow-rgb), 0.05) 65%, transparent 80%)',
              filter: isRetracted ? 'blur(8px)' : 'blur(16px)',
              pointerEvents: 'none',
              zIndex: 0,
              animation: isRgb ? 'rgb-flow 8s linear infinite' : undefined,
            }}
          />
        )}

        {/* Left Notch Bezel Ear (Curved) */}
        {settings.notchStyle === 'notch-attached' && !isBottom && topGap === 0 && !isRetracted && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            style={{
              position: 'absolute',
              top: 0,
              left: `calc(50% - ${currentWidth / 2}px - 16px)`,
              pointerEvents: 'none',
              zIndex: 1,
              transition: 'left 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            <path
              d="M 0,0 Q 16,0 16,16 L 16,0 Z"
              fill={isExpanded ? 'var(--nova-surface-glass)' : 'var(--nova-pill-bg)'}
            />
          </svg>
        )}

        {/* Right Notch Bezel Ear (Curved) */}
        {settings.notchStyle === 'notch-attached' && !isBottom && topGap === 0 && !isRetracted && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            style={{
              position: 'absolute',
              top: 0,
              right: `calc(50% - ${currentWidth / 2}px - 16px)`,
              pointerEvents: 'none',
              zIndex: 1,
              transition: 'right 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            <path
              d="M 16,0 Q 0,0 0,16 L 0,0 Z"
              fill={isExpanded ? 'var(--nova-surface-glass)' : 'var(--nova-pill-bg)'}
            />
          </svg>
        )}

        {/* Chamfered Notch Ears */}
        {isChamfered && !isBottom && topGap === 0 && !isRetracted && (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              style={{
                position: 'absolute',
                top: 0,
                left: `calc(50% - ${currentWidth / 2}px - 16px)`,
                pointerEvents: 'none',
                zIndex: 1,
                transition: 'left 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            >
              <path
                d="M 0,0 L 16,0 L 16,16 Z"
                fill={isExpanded ? 'var(--nova-surface-glass)' : 'var(--nova-pill-bg)'}
              />
            </svg>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              style={{
                position: 'absolute',
                top: 0,
                right: `calc(50% - ${currentWidth / 2}px - 16px)`,
                pointerEvents: 'none',
                zIndex: 1,
                transition: 'right 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            >
              <path
                d="M 16,0 L 0,0 L 0,16 Z"
                fill={isExpanded ? 'var(--nova-surface-glass)' : 'var(--nova-pill-bg)'}
              />
            </svg>
          </>
        )}

        {/* Master Single Island Capsule */}
        <motion.div
          animate={{
            width: currentWidth,
            height: currentHeight,
            borderRadius: isRetracted ? '0 0 8px 8px' : isChamfered ? '0px' : (isSplit && !isExpanded ? '0px' : currentRadius),
          }}
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 32,
            mass: 0.8,
          }}
          style={{
            maxWidth: 'calc(100vw - 16px)',
            maxHeight: '100vh',
            backgroundColor: isSplit && !isExpanded && !isRetracted ? 'transparent' : dynamicBg,
            boxShadow: isSplit && !isExpanded && !isRetracted ? 'none' : isRetracted ? '0 2px 10px rgba(0, 0, 0, 0.6)' : (isExpanded ? 'var(--nova-shadow-card)' : 'var(--nova-shadow-pill)'),
            border: (isSplit && !isExpanded && !isRetracted) || (currentClipPath !== 'none' && !isRetracted) ? 'none' : (
              isRgb
                ? '1.5px solid rgba(96, 165, 250, 0.6)'
                : wallpaperPalette && settings.enableWallpaperTinting
                ? `1.5px solid ${wallpaperPalette.accent}70`
                : `1px solid rgba(255, 255, 255, ${Math.max(0.05, ((settings.glassmorphismBorderGlow ?? 35) / 100) * 0.45)})`
            ),
            borderTop: isNotch || isRetracted ? 'none' : undefined,
            backdropFilter: isSplit && !isExpanded && !isRetracted ? 'none' : `blur(${settings.glassmorphismBlur ?? 28}px) saturate(180%)`,
            WebkitBackdropFilter: isSplit && !isExpanded && !isRetracted ? 'none' : `blur(${settings.glassmorphismBlur ?? 28}px) saturate(180%)`,
            clipPath: (isSplit && !isExpanded && !isRetracted) || isRetracted ? 'none' : currentClipPath,
            position: 'relative',
            overflow: isSplit && !isExpanded && !isRetracted ? 'visible' : 'hidden',
            zIndex: 2,
            cursor: isExpanded ? 'default' : 'pointer',
          }}
          className={isRgb && !(isSplit && !isExpanded && !isRetracted) ? 'rgb-border' : ''}
          onMouseMove={(e) => {
            if (settings.enable3dGyroGlare !== false && !isRetracted) {
              const rect = e.currentTarget.getBoundingClientRect();
              setGlarePos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              });
            }
          }}
          onMouseLeave={() => {
            setGlarePos(null);
            setIsDraggingOver(false);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isDraggingOver && !isRetracted) setIsDraggingOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDraggingOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDraggingOver(false);
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              playSound('action');
              setActiveModule('drop');
              setExpanded(true);
            }
          }}
        >
          {/* Dynamic 3D Gyro Glass Glare Specular Highlight */}
          {settings.enable3dGyroGlare !== false && glarePos && !(isSplit && !isExpanded) && !isRetracted && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: currentRadius,
                pointerEvents: 'none',
                zIndex: 4,
                background: `radial-gradient(circle 140px at ${glarePos.x}px ${glarePos.y}px, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.03) 50%, transparent 80%)`,
                mixBlendMode: 'overlay',
              }}
            />
          )}

          {/* Global Desktop File Drop Indicator */}
          {isDraggingOver && !isRetracted && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: currentRadius,
                border: '2px dashed var(--nova-cyan)',
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                zIndex: 10,
                pointerEvents: 'none',
                backdropFilter: 'blur(6px)',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--nova-cyan)' }}>
                📥 Drop File onto NOVA Shelf
              </span>
            </div>
          )}

          {/* Seasonal Ambient Particles Engine */}
          {!isRetracted && (
            <AmbientParticles mode={settings.ambientParticles} width={currentWidth} height={currentHeight} />
          )}

          {/* Audio-Reactive Equalizer Edge Lighting Pulse */}
          {settings.enableAudioReactiveLighting && media.isPlaying && !(isSplit && !isExpanded) && !isRetracted && (
            <motion.div
              animate={{
                opacity: [0.35, 0.95, 0.35],
                boxShadow: [
                  'inset 0 0 8px rgba(56, 189, 248, 0.3), 0 0 12px rgba(56, 189, 248, 0.35)',
                  'inset 0 0 18px rgba(56, 189, 248, 0.7), 0 0 24px rgba(56, 189, 248, 0.75)',
                  'inset 0 0 8px rgba(56, 189, 248, 0.3), 0 0 12px rgba(56, 189, 248, 0.35)',
                ],
              }}
              transition={{
                duration: 0.85,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: currentRadius,
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />
          )}

          {/* Geometric SVG Edge Lighting & Precise Glass Rim Engine */}
          {!(isSplit && !isExpanded) && !isRetracted && (
            <svg
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 5,
                overflow: 'visible',
              }}
            >
              <defs>
                <linearGradient id="notch-edge-lighting-svg-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  {settings.edgeLightingColor === 'emerald-beam' ? (
                    <>
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="50%" stopColor="#34D399" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </>
                  ) : settings.edgeLightingColor === 'sunset-flare' ? (
                    <>
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="50%" stopColor="#F43F5E" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </>
                  ) : settings.edgeLightingColor === 'violet-aurora' ? (
                    <>
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="50%" stopColor="#A855F7" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </>
                  ) : settings.edgeLightingColor === 'pure-white' ? (
                    <>
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
                      <stop offset="100%" stopColor="#FFFFFF" />
                    </>
                  ) : settings.edgeLightingColor === 'chromatic' ? (
                    <>
                      <stop offset="0%" stopColor="#60A5FA" />
                      <stop offset="33%" stopColor="#F43F5E" />
                      <stop offset="66%" stopColor="#34D399" />
                      <stop offset="100%" stopColor="#38BDF8" />
                    </>
                  ) : settings.edgeLightingColor === 'custom' ? (
                    <>
                      <stop offset="0%" stopColor={customEdgeColor} />
                      <stop offset="50%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor={customEdgeColor} />
                    </>
                  ) : (
                    <>
                      <stop offset="0%" stopColor="#38BDF8" />
                      <stop offset="50%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#60A5FA" />
                    </>
                  )}
                </linearGradient>
              </defs>

              {/* Static Geometric Rim Highlight - Outlines chamfers, wings, blades, and pills */}
              {currentClipPath !== 'none' && (
                <path
                  d={shapePath}
                  fill="none"
                  stroke={
                    isRgb
                      ? 'rgba(96, 165, 250, 0.7)'
                      : wallpaperPalette && settings.enableWallpaperTinting
                      ? `${wallpaperPalette.accent}80`
                      : `rgba(255, 255, 255, ${Math.max(0.12, ((settings.glassmorphismBorderGlow ?? 35) / 100) * 0.5)})`
                  }
                  strokeWidth="1.2"
                />
              )}

              {/* Active Animated Edge Lighting Stroke following exact notch shape contour */}
              {((settings.edgeLightingMode && settings.edgeLightingMode !== 'off') || isPeripheralAlert) && (
                <motion.path
                  d={shapePath}
                  fill="none"
                  stroke="url(#notch-edge-lighting-svg-grad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={
                    settings.edgeLightingMode === 'laser-chase' ? '45 260' :
                    settings.edgeLightingMode === 'corners-inward' ? '70 140' :
                    settings.edgeLightingMode === 'center-outward' ? '80 120' :
                    settings.edgeLightingMode === 'strobe-flow' ? '50 180' :
                    settings.edgeLightingMode === 'neon-ripple' ? '120 120' :
                    settings.edgeLightingMode === 'aurora-sweep' ? '110 220' :
                    settings.edgeLightingMode === 'comet-tail' ? '60 320' :
                    settings.edgeLightingMode === 'dual-spin' ? '60 160 60 160' :
                    settings.edgeLightingMode === 'plasma-flow' ? '140 100' :
                    settings.edgeLightingMode === 'rainbow-cycle' ? '220 120' :
                    settings.edgeLightingMode === 'breathing-glow' ? 'none' :
                    '90 180' // continuous
                  }
                  animate={
                    settings.edgeLightingMode === 'breathing-glow'
                      ? { opacity: [0.35, 1, 0.35], strokeWidth: [1.2, 2.5, 1.2] }
                      : settings.edgeLightingMode === 'corners-inward'
                      ? { strokeDashoffset: [0, -210, 0] }
                      : settings.edgeLightingMode === 'center-outward'
                      ? { strokeDashoffset: [100, -100] }
                      : settings.edgeLightingMode === 'neon-ripple'
                      ? { opacity: [0.4, 1, 0.4], strokeDashoffset: [0, -320] }
                      : settings.edgeLightingMode === 'laser-chase'
                      ? { strokeDashoffset: [0, -650] }
                      : settings.edgeLightingMode === 'aurora-sweep'
                      ? { opacity: [0.45, 1, 0.45], strokeDashoffset: [0, -680] }
                      : settings.edgeLightingMode === 'comet-tail'
                      ? { strokeWidth: [1.8, 3.2, 1.8], strokeDashoffset: [0, -760] }
                      : settings.edgeLightingMode === 'dual-spin'
                      ? { strokeDashoffset: [0, -440] }
                      : settings.edgeLightingMode === 'plasma-flow'
                      ? { opacity: [0.55, 1, 0.55], strokeDashoffset: [160, -360], strokeWidth: [1.8, 3, 1.8] }
                      : settings.edgeLightingMode === 'rainbow-cycle'
                      ? { strokeDashoffset: [0, -680] }
                      : { strokeDashoffset: [0, -540] } // continuous & strobe
                  }
                  transition={{
                    duration:
                      settings.edgeLightingMode === 'laser-chase' || settings.edgeLightingMode === 'comet-tail'
                        ? edgeDuration * 0.6
                        : settings.edgeLightingMode === 'aurora-sweep'
                        ? edgeDuration * 1.2
                        : edgeDuration,
                    repeat: Infinity,
                    ease: settings.edgeLightingMode === 'strobe-flow' ? 'linear' : 'easeInOut',
                  }}
                />
              )}
            </svg>
          )}
          <AnimatePresence mode="wait">
            {isRetracted ? (
              <motion.div
                key="stealth-indicator"
                initial={{ opacity: 0, scaleY: 0.5 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0.5 }}
                transition={{ duration: 0.15 }}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={handleManualExpand}
                title="NOVA Stealth Bezel — Click or hover to restore notch"
              >
                <div
                  style={{
                    width: 34,
                    height: 3,
                    borderRadius: 2,
                    background: isRgb
                      ? 'linear-gradient(90deg, #38BDF8, #A855F7, #EC4899)'
                      : wallpaperPalette && settings.enableWallpaperTinting
                      ? wallpaperPalette.accent
                      : 'var(--nova-cyan)',
                    boxShadow: isRgb
                      ? '0 0 8px rgba(56, 189, 248, 0.8)'
                      : '0 0 8px var(--nova-glow-color)',
                    animation: 'pulse 2.2s infinite ease-in-out',
                  }}
                />
              </motion.div>
            ) : !isExpanded ? (
              <motion.div
                key="pill-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: isSplit ? 0 : (isCompact ? '0 10px' : '0 14px'),
                }}
                onClick={handleManualExpand}
              >
                <IslandPillContent isCompact={isCompact} />
              </motion.div>
            ) : (
              <motion.div
                key="expanded-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <IslandExpandedContent onCollapse={handleManualCollapse} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Floating Peripheral Alert Toast (Clipboard & Calendar) */}
        <AnimatePresence>
          {isClipboardActive && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              style={{
                position: 'absolute',
                ...(isBottom ? { bottom: currentHeight + 6 } : { top: currentHeight + 6 }),
                backgroundColor: 'rgba(11, 13, 18, 0.92)',
                border: '1px solid var(--nova-cyan)',
                borderRadius: 'var(--nova-radius-pill)',
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 14px rgba(56, 189, 248, 0.35)',
                zIndex: 9990,
                pointerEvents: 'none',
              }}
            >
              <span style={{ fontSize: '11px' }}>📋</span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--nova-cyan)' }}>
                Clipboard updated
              </span>
            </motion.div>
          )}

          {isCalendarActive && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              style={{
                position: 'absolute',
                ...(isBottom ? { bottom: currentHeight + 6 } : { top: currentHeight + 6 }),
                backgroundColor: 'rgba(11, 13, 18, 0.92)',
                border: '1px solid #F59E0B',
                borderRadius: 'var(--nova-radius-pill)',
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                zIndex: 9990,
                pointerEvents: 'none',
              }}
            >
              <span style={{ fontSize: '11px' }}>📅</span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#F59E0B' }}>
                Upcoming: {calendarAlert?.title} in {calendarAlert?.minutesLeft}m
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Whisper & Quick Command Bar Overlay */}
        <AiWhisperCommandBar
          isOpen={isAiWhisperOpen}
          bottom={isBottom}
          onClose={() => {
            if (useIslandStore.getState().isExpanded) setKeepOpen(true);
            setAiWhisperOpen(false);
          }}
        />
      </div>
    </div>
  );
};
