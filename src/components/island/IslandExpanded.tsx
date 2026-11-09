import React from 'react';
import { motion } from 'framer-motion';
import { useIslandStore } from '../../stores/useIslandStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { MODULE_REGISTRY } from '../../modules/registry';
import {
  LayoutGrid,
  ClipboardCopy,
  FileText,
  Activity,
  Timer,
  QrCode,
  CloudSun,
  Settings,
  Pin,
  X,
  Search,
} from 'lucide-react';

import { HomeView } from '../../modules/home/HomeView';
import { ClipboardView } from '../../modules/clipboard/ClipboardView';
import { NotesView } from '../../modules/notes/NotesView';
import { SystemView } from '../../modules/system/SystemView';
import { TimersView } from '../../modules/timers/TimersView';
import { DropView } from '../../modules/drop/DropView';
import { WeatherView } from '../../modules/weather/WeatherView';
import { SettingsView } from '../../modules/settings/SettingsView';
import { LauncherView } from '../../modules/launcher/LauncherView';

interface IslandExpandedProps {
  onCollapse: () => void;
}

export const IslandExpanded: React.FC<IslandExpandedProps> = ({ onCollapse }) => {
  const { activeModule, setActiveModule, isPinned, setPinned } = useIslandStore();
  const { settings } = useThemeStore();

  const isRgb = settings.enableRgbBorder || settings.themeMode === 'rgb';

  // Primary navigation tabs
  const tabs = [
    { id: 'home', label: 'Home', icon: LayoutGrid },
    { id: 'clipboard', label: 'Clipboard', icon: ClipboardCopy },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'system', label: 'System', icon: Activity },
    { id: 'timers', label: 'Timers', icon: Timer },
    { id: 'drop', label: 'Drop', icon: QrCode },
    { id: 'weather', label: 'Weather', icon: CloudSun },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'home':
        return <HomeView />;
      case 'clipboard':
        return <ClipboardView />;
      case 'notes':
        return <NotesView />;
      case 'system':
        return <SystemView />;
      case 'timers':
        return <TimersView />;
      case 'drop':
        return <DropView />;
      case 'weather':
        return <WeatherView />;
      case 'settings':
        return <SettingsView />;
      case 'launcher':
        return <LauncherView />;
      default:
        return <HomeView />;
    }
  };

  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <motion.div
      layoutId="nova-island-body"
      style={{
        width: settings.expandedWidth,
        maxHeight: settings.expandedHeight,
        borderRadius: 'var(--nova-radius-card)',
        backgroundColor: 'var(--nova-surface-glass)',
        boxShadow: isRgb ? 'var(--nova-shadow-card)' : 'var(--nova-shadow-card)',
        border: isRgb
          ? '1px solid rgba(102, 136, 255, 0.45)'
          : '1px solid var(--nova-border)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
      className={isRgb ? 'rgb-border' : ''}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 34,
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px 8px 18px',
          borderBottom: '1px solid var(--nova-border)',
        }}
      >
        {/* Brand & Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: 'var(--nova-blue)',
                boxShadow: '0 0 8px var(--nova-blue)',
              }}
            />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: 'var(--nova-text-primary)',
              }}
            >
              NOVA
            </span>
          </div>

          <span style={{ fontSize: '11px', color: 'var(--nova-text-muted)' }}>|</span>

          <div
            style={{
              fontSize: '11px',
              color: 'var(--nova-text-secondary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span>{timeString}</span>
            <span style={{ margin: '0 4px', color: 'var(--nova-text-muted)' }}>•</span>
            <span>{dateString}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setActiveModule('launcher')}
            style={{
              padding: 5,
              color: activeModule === 'launcher' ? 'var(--nova-blue)' : 'var(--nova-text-secondary)',
            }}
            title="Search & Launcher"
          >
            <Search size={14} />
          </button>

          <button
            onClick={() => setPinned(!isPinned)}
            style={{
              padding: 5,
              color: isPinned ? 'var(--nova-warning)' : 'var(--nova-text-secondary)',
            }}
            title={isPinned ? 'Unpin (Auto-collapse enabled)' : 'Pin Open'}
          >
            <Pin size={14} />
          </button>

          <button
            onClick={onCollapse}
            style={{
              padding: 5,
              color: 'var(--nova-text-secondary)',
            }}
            title="Collapse (Esc)"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Navigation Pill Strip */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: '8px 16px',
          borderBottom: '1px solid var(--nova-border)',
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeModule === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveModule(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                borderRadius: 'var(--nova-radius-pill)',
                fontSize: '11px',
                fontWeight: isActive ? 600 : 500,
                backgroundColor: isActive ? 'rgba(102, 136, 255, 0.2)' : 'transparent',
                color: isActive ? 'var(--nova-blue)' : 'var(--nova-text-secondary)',
                border: isActive
                  ? '1px solid rgba(102, 136, 255, 0.4)'
                  : '1px solid transparent',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={12} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main View Area */}
      <div style={{ padding: '14px 18px', overflowY: 'auto', flex: 1 }}>
        {renderModuleContent()}
      </div>
    </motion.div>
  );
};
