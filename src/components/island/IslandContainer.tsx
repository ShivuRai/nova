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
  } = useIslandStore();
  const { media, updateMedia } = useSystemStore();
  const { settings } = useThemeStore();

  const hoverTimerRef = useRef<number | null>(null);
  const collapseTimerRef = useRef<number | null>(null);
  const windowResizeTimerRef = useRef<number | null>(null);

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
        settings.expandedHeight,
        settings.screenPosition,
        settings.notchStyle
      );
    } else {
      // Delay window shrink until after the spring morph animation completes (350ms)
      windowResizeTimerRef.current = window.setTimeout(() => {
        resizeDesktopWindow(
          false,
          settings.pillWidth,
          settings.pillHeight,
          settings.screenPosition,
          settings.notchStyle
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
    settings.expandedWidth,
    settings.expandedHeight,
    settings.pillWidth,
    settings.pillHeight,
    settings.screenPosition,
    settings.notchStyle,
  ]);

  // Global hotkey & IPC listeners from Electron
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        const handleToggle = () => toggleExpanded();
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

        ipcRenderer.on('toggle-island', handleToggle);
        ipcRenderer.on('open-module', handleOpenModule);
        ipcRenderer.on('media-status-update', handleMediaUpdate);
        return () => {
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
  const isNotch = settings.notchStyle === 'notch-attached' && !isBottom;
  const isSquircle = settings.notchStyle === 'squircle-bar';
  const isCompact = settings.notchStyle === 'compact-badge';
  const isRgb = settings.enableRgbBorder || settings.themeMode === 'rgb';

  const effectivePillWidth = isCompact
    ? 170
    : liveActivity || media.isPlaying
    ? 260
    : settings.pillWidth;
  const effectivePillHeight = isCompact ? 32 : settings.pillHeight;

  const currentWidth = isExpanded ? settings.expandedWidth : effectivePillWidth;
  const currentHeight = isExpanded ? settings.expandedHeight : effectivePillHeight;

  // Use explicit matching pixel strings so Framer Motion interpolates cleanly without getting stuck in an oval
  let currentRadius = '20px';
  if (isNotch) {
    currentRadius = isExpanded ? '0 0 24px 24px' : '0 0 20px 20px';
  } else if (isSquircle) {
    currentRadius = isExpanded ? '24px' : '14px';
  } else if (isCompact) {
    currentRadius = isExpanded ? '24px' : '16px';
  } else {
    // Floating Pill: 20px when collapsed (perfect pill), 24px when expanded (crisp modern card)
    currentRadius = isExpanded ? '24px' : '20px';
  }

  let glowRadius = '24px';
  if (isNotch) {
    glowRadius = isExpanded ? '0 0 28px 28px' : '0 0 24px 24px';
  } else if (isSquircle) {
    glowRadius = isExpanded ? '28px' : '18px';
  } else if (isCompact) {
    glowRadius = isExpanded ? '28px' : '20px';
  } else {
    glowRadius = isExpanded ? '28px' : '24px';
  }

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
        paddingTop: !isBottom && settings.notchStyle !== 'notch-attached' ? 18 : 0,
        paddingBottom: isBottom ? 18 : 0,
        paddingLeft: isLeft ? 18 : 0,
        paddingRight: isRight ? 18 : 0,
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

        {/* Left Notch Bezel Ear */}
        {isNotch && (
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

        {/* Right Notch Bezel Ear */}
        {isNotch && (
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
              : '1px solid var(--nova-border)',
            borderTop: isNotch ? 'none' : undefined,
            backdropFilter: 'blur(30px) saturate(180%)',
            WebkitBackdropFilter: 'blur(30px) saturate(180%)',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 2,
            cursor: isExpanded ? 'default' : 'pointer',
          }}
          className={isRgb ? 'rgb-border' : ''}
        >
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
