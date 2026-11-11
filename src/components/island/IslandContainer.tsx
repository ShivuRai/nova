import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIslandStore } from '../../stores/useIslandStore';
import { useSystemStore } from '../../stores/useSystemStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { resizeDesktopWindow, getWallpaperPalette } from '../../services/platformService';
import { IslandPillContent } from './IslandPill';
import { IslandExpandedContent } from './IslandExpanded';
import { AmbientParticles } from './AmbientParticles';
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
    toggleExpanded,
    isPinned,
    isInteracting,
    setActiveModule,
    liveActivity,
    activeModule,
  } = useIslandStore();
  const { media, updateMedia } = useSystemStore();
  const { settings } = useThemeStore();

  const [wallpaperPalette, setWallpaperPalette] = useState<{ accent: string; glow: string; tint: string } | null>(null);
  const [glarePos, setGlarePos] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

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
    'quick-settings': 350,
    'file-tools': 350,
    links: 350,
    analytics: 355,
    revenue: 355,
    weather: 385,
    rgb: 385,
    settings: 410,
    'ai-coding': 415,
  };

  const targetExpandedHeight = MODULE_HEIGHTS[activeModule] || 360;

  // Sync window size & position when expanded state or position changes
  useEffect(() => {
    // Clear any pending collapse window shrink
    if (windowResizeTimerRef.current) {
      window.clearTimeout(windowResizeTimerRef.current);
      windowResizeTimerRef.current = null;
    }

    if (isExpanded) {
      // Expand window immediately so the blooming animation has full space
      resizeDesktopWindow(
        true,
        settings.expandedWidth,
        targetExpandedHeight,
        settings.screenPosition,
        settings.notchStyle,
        settings.topOffset ?? 0,
        settings.sideMargin ?? 16
      );
    } else {
      // Delay window shrink until after the spring morph animation completes (350ms)
      windowResizeTimerRef.current = window.setTimeout(() => {
        resizeDesktopWindow(
          false,
          settings.pillWidth,
          settings.pillHeight,
          settings.screenPosition,
          settings.notchStyle,
          settings.topOffset ?? 0,
          settings.sideMargin ?? 16
        );
      }, 350);
    }

    return () => {
      if (windowResizeTimerRef.current) {
        window.clearTimeout(windowResizeTimerRef.current);
      }
    };
  }, [
    isExpanded,
    targetExpandedHeight,
    activeModule,
    settings.expandedWidth,
    settings.pillWidth,
    settings.pillHeight,
    settings.screenPosition,
    settings.notchStyle,
    settings.topOffset,
    settings.sideMargin,
  ]);

  // Global hotkey & IPC listeners from Electron
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        const handleToggle = () => toggleExpanded();
        const handleBringToFront = () => {
          setExpanded(true);
        };
        const handleOpenModule = (_event: any, moduleId: string) => {
          if (moduleId) {
            setActiveModule(moduleId);
          }
          setExpanded(true);
        };
        const handleMediaUpdate = (_event: any, data: any) => {
          if (data && typeof data.isPlaying === 'boolean') {
            updateMedia({
              isPlaying: data.isPlaying,
              title: data.title || '',
              artist: data.artist || (data.isPlaying ? 'Media Playback' : ''),
            });
          }
        };

        ipcRenderer.on('bring-to-front', handleBringToFront);
        ipcRenderer.on('toggle-island', handleToggle);
        ipcRenderer.on('open-module', handleOpenModule);
        ipcRenderer.on('media-status-update', handleMediaUpdate);
        return () => {
          ipcRenderer.removeListener('bring-to-front', handleBringToFront);
          ipcRenderer.removeListener('toggle-island', handleToggle);
          ipcRenderer.removeListener('open-module', handleOpenModule);
          ipcRenderer.removeListener('media-status-update', handleMediaUpdate);
        };
      } catch (e) {}
    }
  }, [toggleExpanded, setActiveModule, setExpanded, updateMedia]);

  // Global Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, setExpanded]);

  const handleMouseEnter = () => {
    playHoverSound();
    if (collapseTimerRef.current) {
      window.clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }

    if (!isExpanded) {
      hoverTimerRef.current = window.setTimeout(() => {
        playExpandSound();
        setExpanded(true);
      }, settings.hoverDelayMs);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    if (isExpanded && !isPinned && !isInteracting) {
      collapseTimerRef.current = window.setTimeout(() => {
        playCollapseSound();
        setExpanded(false);
      }, settings.collapseDelayMs);
    }
  };

  const handleManualExpand = () => {
    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
    playClickSound();
    playExpandSound();
    setExpanded(true);
  };

  const handleManualCollapse = () => {
    if (collapseTimerRef.current) window.clearTimeout(collapseTimerRef.current);
    playClickSound();
    playCollapseSound();
    setExpanded(false);
  };

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

  const customChamfer = Math.max(0, Math.min(28, settings.customNotchChamfer ?? 14));
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

  const currentWidth = isExpanded ? settings.expandedWidth : effectivePillWidth;
  const currentHeight = isExpanded ? targetExpandedHeight : effectivePillHeight;

  // Explicit radius per shape
  let currentRadius = '20px';
  if (isChamfered) {
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
  if (isChamfered || isNotch) {
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

  const topGap = typeof settings.topOffset === 'number' ? settings.topOffset : (isNotch ? 0 : 8);
  const sideGap = typeof settings.sideMargin === 'number' ? settings.sideMargin : 16;

  // Explicit clip-path for faceted geometric notch shapes
  let currentClipPath = 'none';
  if (isCustomShape) {
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
    ? (isExpanded ? 'rgba(15, 23, 42, 0.88)' : 'rgba(11, 13, 18, 0.92)')
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
  const resolvedEdgeBackground =
    settings.edgeLightingColor === 'custom'
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
        paddingTop: !isBottom ? topGap : 0,
        paddingBottom: isBottom ? topGap : 0,
        paddingLeft: isLeft ? sideGap : 0,
        paddingRight: isRight ? sideGap : 0,
        pointerEvents: 'none', // pass through clicks on transparent canvas
      }}
    >
      <div
        style={{
          position: 'relative',
          pointerEvents: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: isBottom ? 'flex-end' : 'flex-start',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Natural Ambient Glow Halo - Smoothly scales and feathers with capsule */}
        {settings.enableGlow && (
          <motion.div
            animate={{
              width: currentWidth + (isNotch ? 40 : 32),
              height: currentHeight + (isNotch ? 20 : 32),
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
              top: isNotch ? 0 : -8,
              background: isRgb
                ? 'radial-gradient(ellipse at center, rgba(96, 165, 250, 0.45) 0%, rgba(167, 139, 250, 0.28) 40%, rgba(244, 63, 94, 0.10) 65%, transparent 80%)'
                : isNotch
                ? 'radial-gradient(ellipse at 50% 0%, var(--nova-glow-color) 0%, rgba(var(--nova-glow-rgb), 0.22) 40%, rgba(var(--nova-glow-rgb), 0.05) 65%, transparent 80%)'
                : 'radial-gradient(ellipse at center, var(--nova-glow-color) 0%, rgba(var(--nova-glow-rgb), 0.22) 40%, rgba(var(--nova-glow-rgb), 0.05) 65%, transparent 80%)',
              filter: 'blur(16px)',
              pointerEvents: 'none',
              zIndex: 0,
              animation: isRgb ? 'rgb-flow 8s linear infinite' : undefined,
            }}
          />
        )}

        {/* Left Notch Bezel Ear (Curved) */}
        {settings.notchStyle === 'notch-attached' && !isBottom && topGap === 0 && (
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
        {settings.notchStyle === 'notch-attached' && !isBottom && topGap === 0 && (
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
        {isChamfered && !isBottom && topGap === 0 && (
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
            borderRadius: isChamfered ? '0px' : (isSplit && !isExpanded ? '0px' : currentRadius),
          }}
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 32,
            mass: 0.8,
          }}
          style={{
            backgroundColor: isSplit && !isExpanded ? 'transparent' : dynamicBg,
            boxShadow: isSplit && !isExpanded ? 'none' : (isExpanded ? 'var(--nova-shadow-card)' : 'var(--nova-shadow-pill)'),
            border: (isSplit && !isExpanded) || currentClipPath !== 'none' ? 'none' : (
              isRgb
                ? '1.5px solid rgba(96, 165, 250, 0.6)'
                : wallpaperPalette && settings.enableWallpaperTinting
                ? `1.5px solid ${wallpaperPalette.accent}70`
                : `1px solid rgba(255, 255, 255, ${Math.max(0.05, ((settings.glassmorphismBorderGlow ?? 35) / 100) * 0.45)})`
            ),
            borderTop: isNotch ? 'none' : undefined,
            backdropFilter: isSplit && !isExpanded ? 'none' : `blur(${settings.glassmorphismBlur ?? 28}px) saturate(180%)`,
            WebkitBackdropFilter: isSplit && !isExpanded ? 'none' : `blur(${settings.glassmorphismBlur ?? 28}px) saturate(180%)`,
            clipPath: isSplit && !isExpanded ? 'none' : currentClipPath,
            position: 'relative',
            overflow: isSplit && !isExpanded ? 'visible' : 'hidden',
            zIndex: 2,
            cursor: isExpanded ? 'default' : 'pointer',
          }}
          className={isRgb && !(isSplit && !isExpanded) ? 'rgb-border' : ''}
          onMouseMove={(e) => {
            if (settings.enable3dGyroGlare !== false) {
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
            if (!isDraggingOver) setIsDraggingOver(true);
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
          {settings.enable3dGyroGlare !== false && glarePos && !(isSplit && !isExpanded) && (
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
          {isDraggingOver && (
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
          <AmbientParticles mode={settings.ambientParticles} width={currentWidth} height={currentHeight} />

          {/* Audio-Reactive Equalizer Edge Lighting Pulse */}
          {settings.enableAudioReactiveLighting && media.isPlaying && !(isSplit && !isExpanded) && (
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
          {!(isSplit && !isExpanded) && (
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
              {settings.edgeLightingMode && settings.edgeLightingMode !== 'off' && (
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
            {!isExpanded ? (
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
      </div>
    </div>
  );
};
