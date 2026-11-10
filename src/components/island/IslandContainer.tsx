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

  // Sync window size when expanded state changes
  useEffect(() => {
    if (isExpanded) {
      resizeDesktopWindow(true, settings.expandedWidth, settings.expandedHeight);
    } else {
      resizeDesktopWindow(false, settings.pillWidth, settings.pillHeight);
    }
  }, [isExpanded, settings.expandedWidth, settings.expandedHeight, settings.pillWidth, settings.pillHeight]);

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

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100vw',
        paddingTop: settings.notchStyle === 'notch-attached' ? 0 : 8,
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
