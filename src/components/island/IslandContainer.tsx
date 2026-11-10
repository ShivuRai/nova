import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIslandStore } from '../../stores/useIslandStore';
import { useSystemStore } from '../../stores/useSystemStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { resizeDesktopWindow } from '../../services/platformService';
import { IslandPillContent } from './IslandPill';
import { IslandExpandedContent } from './IslandExpanded';

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

  const hoverTimerRef = useRef<number | null>(null);
  const collapseTimerRef = useRef<number | null>(null);
  const windowResizeTimerRef = useRef<number | null>(null);

  const MODULE_HEIGHTS: Record<string, number> = {
    home: 295,
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
    if (collapseTimerRef.current) {
      window.clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }

    if (!isExpanded) {
      hoverTimerRef.current = window.setTimeout(() => {
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
        setExpanded(false);
      }, settings.collapseDelayMs);
    }
  };

  const handleManualExpand = () => {
    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
    setExpanded(true);
  };

  const handleManualCollapse = () => {
    if (collapseTimerRef.current) window.clearTimeout(collapseTimerRef.current);
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
  const isRgb = settings.enableRgbBorder || settings.themeMode === 'rgb';

  const effectivePillWidth = isCompact
    ? 170
    : liveActivity || media.isPlaying || (settings.pillDisplayContent === 'media-priority' && media.title)
    ? 270
    : settings.pillDisplayContent === 'telemetry'
    ? 260
    : settings.pillWidth;
  const effectivePillHeight = isCompact ? 32 : settings.pillHeight;

  const currentWidth = isExpanded ? settings.expandedWidth : effectivePillWidth;
  const currentHeight = isExpanded ? targetExpandedHeight : effectivePillHeight;

  // Use explicit matching pixel strings so Framer Motion interpolates cleanly without getting stuck in an oval
  let currentRadius = '20px';
  if (isChamfered) {
    currentRadius = isExpanded ? '24px' : '0 0 16px 16px';
  } else if (isNotch) {
    currentRadius = isExpanded ? '24px' : '0 0 20px 20px';
  } else if (isSquircle) {
    currentRadius = isExpanded ? '24px' : '14px';
  } else if (isCompact) {
    currentRadius = isExpanded ? '24px' : '16px';
  } else if (isTeardrop) {
    currentRadius = isExpanded ? '24px' : '22px 8px 22px 18px';
  } else if (isHexPill) {
    currentRadius = isExpanded ? '24px' : '12px';
  } else if (isBlade) {
    currentRadius = isExpanded ? '24px' : '18px 4px 18px 4px';
  } else if (isDiamond) {
    currentRadius = isExpanded ? '24px' : '8px 24px 8px 24px';
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

  const EDGE_GRADIENTS: Record<string, string> = {
    'cyan-pulse': 'linear-gradient(90deg, #38BDF8, #3B82F6, #60A5FA, #38BDF8)',
    'emerald-beam': 'linear-gradient(90deg, #10B981, #34D399, #06B6D4, #10B981)',
    'sunset-flare': 'linear-gradient(90deg, #F59E0B, #F43F5E, #EC4899, #F59E0B)',
    'violet-aurora': 'linear-gradient(90deg, #8B5CF6, #A855F7, #EC4899, #8B5CF6)',
    'pure-white': 'linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,255,255,0.25), rgba(255,255,255,0.95))',
    'chromatic': 'linear-gradient(90deg, #60A5FA, #A78BFA, #F43F5E, #38BDF8, #34D399, #60A5FA)',
  };

  const topGap = typeof settings.topOffset === 'number' ? settings.topOffset : (isNotch ? 0 : 8);
  const sideGap = typeof settings.sideMargin === 'number' ? settings.sideMargin : 16;

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

        {/* Dynamic Wing Aero Tabs */}
        {isDynamicWing && !isExpanded && (
          <>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: `calc(50% - ${currentWidth / 2}px - 8px)`,
                transform: 'translateY(-50%)',
                width: 8,
                height: 16,
                backgroundColor: 'var(--nova-pill-bg)',
                borderLeft: '1px solid var(--nova-border)',
                borderTop: '1px solid var(--nova-border)',
                borderBottom: '1px solid var(--nova-border)',
                borderRadius: '8px 0 0 8px',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                right: `calc(50% - ${currentWidth / 2}px - 8px)`,
                transform: 'translateY(-50%)',
                width: 8,
                height: 16,
                backgroundColor: 'var(--nova-pill-bg)',
                borderRight: '1px solid var(--nova-border)',
                borderTop: '1px solid var(--nova-border)',
                borderBottom: '1px solid var(--nova-border)',
                borderRadius: '0 8px 8px 0',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />
          </>
        )}

        {/* Master Single Island Capsule */}
        <motion.div
          animate={{
            width: currentWidth,
            height: currentHeight,
            borderRadius: currentRadius,
          }}
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 32,
            mass: 0.8,
          }}
          style={{
            backgroundColor: isExpanded ? 'var(--nova-surface-glass)' : 'var(--nova-pill-bg)',
            boxShadow: isExpanded ? 'var(--nova-shadow-card)' : 'var(--nova-shadow-pill)',
            border: isRgb
              ? '1.5px solid rgba(96, 165, 250, 0.6)'
              : `1px solid rgba(255, 255, 255, ${Math.max(0.05, ((settings.glassmorphismBorderGlow ?? 35) / 100) * 0.45)})`,
            borderTop: isNotch ? 'none' : undefined,
            backdropFilter: `blur(${settings.glassmorphismBlur ?? 28}px) saturate(180%)`,
            WebkitBackdropFilter: `blur(${settings.glassmorphismBlur ?? 28}px) saturate(180%)`,
            position: 'relative',
            overflow: 'hidden',
            zIndex: 2,
            cursor: isExpanded ? 'default' : 'pointer',
          }}
          className={isRgb ? 'rgb-border' : ''}
        >
          {/* Minimalistic Edge Lighting Overlay */}
          {settings.edgeLightingMode && settings.edgeLightingMode !== 'off' && (
            <div
              className={`edge-lighting-trail mode-${settings.edgeLightingMode} speed-${settings.edgeLightingSpeed || 'normal'}`}
              style={{
                background:
                  EDGE_GRADIENTS[settings.edgeLightingColor || 'cyan-pulse'] ||
                  EDGE_GRADIENTS['cyan-pulse'],
              }}
            />
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
                  padding: isCompact ? '0 10px' : '0 14px',
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
