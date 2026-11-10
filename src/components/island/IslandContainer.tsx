import React, { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useIslandStore } from '../../stores/useIslandStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { resizeDesktopWindow } from '../../services/platformService';
import { IslandPill } from './IslandPill';
import { IslandExpanded } from './IslandExpanded';

export const IslandContainer: React.FC = () => {
  const {
    isExpanded,
    setExpanded,
    toggleExpanded,
    isPinned,
    isInteracting,
  } = useIslandStore();
  const { settings } = useThemeStore();

  const hoverTimerRef = useRef<number | null>(null);
  const collapseTimerRef = useRef<number | null>(null);

  // Sync window size & position when expanded state or position changes
  useEffect(() => {
    if (isExpanded) {
      resizeDesktopWindow(
        true,
        settings.expandedWidth,
        settings.expandedHeight,
        settings.screenPosition,
        settings.notchStyle
      );
    } else {
      resizeDesktopWindow(
        false,
        settings.pillWidth,
        settings.pillHeight,
        settings.screenPosition,
        settings.notchStyle
      );
    }
  }, [
    isExpanded,
    settings.expandedWidth,
    settings.expandedHeight,
    settings.pillWidth,
    settings.pillHeight,
    settings.screenPosition,
    settings.notchStyle,
  ]);

  // Global hotkey listener from Electron IPC
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        const handleToggle = () => toggleExpanded();
        ipcRenderer.on('toggle-island', handleToggle);
        return () => {
          ipcRenderer.removeListener('toggle-island', handleToggle);
        };
      } catch (e) {}
    }
  }, [toggleExpanded]);

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
    // Cancel any pending collapse
    if (collapseTimerRef.current) {
      window.clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }

    // Start hover delay
    if (!isExpanded) {
      hoverTimerRef.current = window.setTimeout(() => {
        setExpanded(true);
      }, settings.hoverDelayMs);
    }
  };

  const handleMouseLeave = () => {
    // Cancel pending expand
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    // Only collapse if not pinned and not interacting
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

  const justifyContent = isLeft ? 'flex-start' : isRight ? 'flex-end' : 'center';
  const alignItems = isBottom ? 'flex-end' : 'flex-start';

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
        pointerEvents: 'none', // pass through outside clicks
      }}
    >
      <div style={{ pointerEvents: 'auto' }}>
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <IslandPill
              key="pill"
              onHoverStart={handleMouseEnter}
              onHoverEnd={handleMouseLeave}
              onClick={handleManualExpand}
            />
          ) : (
            <IslandExpanded
              key="expanded"
              onCollapse={handleManualCollapse}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
