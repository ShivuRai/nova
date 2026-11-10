import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useIslandStore } from '../../stores/useIslandStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { MODULE_REGISTRY } from '../../modules/registry';
import {
  LayoutGrid,
  ClipboardCopy,
  FileText,
  Bookmark,
  CloudSun,
  ArrowLeftRight,
  QrCode,
  FolderArchive,
  RefreshCw,
  Wrench,
  Timer,
  CalendarDays,
  Globe,
  BarChart2,
  Activity,
  MessageSquare,
  Search,
  Sliders,
  Cpu,
  TrendingUp,
  DollarSign,
  Smile,
  Sparkles,
  Settings,
  Pin,
  X,
} from 'lucide-react';

import { HomeView } from '../../modules/home/HomeView';
import { ClipboardView } from '../../modules/clipboard/ClipboardView';
import { NotesView } from '../../modules/notes/NotesView';
import { LinksView } from '../../modules/links/LinksView';
import { WeatherView } from '../../modules/weather/WeatherView';
import { UnitsView } from '../../modules/units/UnitsView';
import { DropView } from '../../modules/drop/DropView';
import { ShelfView } from '../../modules/shelf/ShelfView';
import { ConverterView } from '../../modules/converter/ConverterView';
import { FileToolsView } from '../../modules/file-tools/FileToolsView';
import { TimersView } from '../../modules/timers/TimersView';
import { CalendarView } from '../../modules/calendar/CalendarView';
import { ClockView } from '../../modules/clock/ClockView';
import { ScreenTimeView } from '../../modules/screen-time/ScreenTimeView';
import { SystemView } from '../../modules/system/SystemView';
import { MessageView } from '../../modules/message/MessageView';
import { LauncherView } from '../../modules/launcher/LauncherView';
import { QuickSettingsView } from '../../modules/quick-settings/QuickSettingsView';
import { AiCodingView } from '../../modules/ai-coding/AiCodingView';
import { AnalyticsView } from '../../modules/analytics/AnalyticsView';
import { RevenueView } from '../../modules/revenue/RevenueView';
import { PetView } from '../../modules/pet/PetView';
import { RgbView } from '../../modules/rgb/RgbView';
import { SettingsView } from '../../modules/settings/SettingsView';

interface IslandExpandedProps {
  onCollapse: () => void;
}

export const IslandExpanded: React.FC<IslandExpandedProps> = ({ onCollapse }) => {
  const { activeModule, setActiveModule, isPinned, setPinned } = useIslandStore();
  const { settings } = useThemeStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const isRgb = settings.enableRgbBorder || settings.themeMode === 'rgb';

  // Map icons
  const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
    home: LayoutGrid,
    clipboard: ClipboardCopy,
    notes: FileText,
    links: Bookmark,
    weather: CloudSun,
    units: ArrowLeftRight,
    drop: QrCode,
    shelf: FolderArchive,
    converter: RefreshCw,
    'file-tools': Wrench,
    timers: Timer,
    calendar: CalendarDays,
    clock: Globe,
    'screen-time': BarChart2,
    system: Activity,
    message: MessageSquare,
    launcher: Search,
    'quick-settings': Sliders,
    'ai-coding': Cpu,
    analytics: TrendingUp,
    revenue: DollarSign,
    pet: Smile,
    rgb: Sparkles,
    settings: Settings,
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'everyday', label: 'Everyday' },
    { id: 'files', label: 'Files' },
    { id: 'time', label: 'Time' },
    { id: 'desktop', label: 'Desktop' },
    { id: 'specialist', label: 'Specialist' },
  ];

  const visibleModules = MODULE_REGISTRY.filter(
    (m) => selectedCategory === 'all' || m.category === selectedCategory
  );

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'home':
        return <HomeView />;
      case 'clipboard':
        return <ClipboardView />;
      case 'notes':
        return <NotesView />;
      case 'links':
        return <LinksView />;
      case 'weather':
        return <WeatherView />;
      case 'units':
        return <UnitsView />;
      case 'drop':
        return <DropView />;
      case 'shelf':
        return <ShelfView />;
      case 'converter':
        return <ConverterView />;
      case 'file-tools':
        return <FileToolsView />;
      case 'timers':
        return <TimersView />;
      case 'calendar':
        return <CalendarView />;
      case 'clock':
        return <ClockView />;
      case 'screen-time':
        return <ScreenTimeView />;
      case 'system':
        return <SystemView />;
      case 'message':
        return <MessageView />;
      case 'launcher':
        return <LauncherView />;
      case 'quick-settings':
        return <QuickSettingsView />;
      case 'ai-coding':
        return <AiCodingView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'revenue':
        return <RevenueView />;
      case 'pet':
        return <PetView />;
      case 'rgb':
        return <RgbView />;
      case 'settings':
        return <SettingsView />;
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
        boxShadow: 'var(--nova-shadow-card)',
        border: isRgb
          ? '1px solid rgba(96, 165, 250, 0.55)'
          : '1px solid var(--nova-border)',
        backdropFilter: 'blur(30px) saturate(180%) contrast(105%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%) contrast(105%)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
      className={isRgb ? 'rgb-border' : ''}
      transition={{
        type: 'spring',
        stiffness: 420,
        damping: 32,
        mass: 0.85,
      }}
    >
      {/* Specular top light streak for ultra-luxurious glass look */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent)',
          pointerEvents: 'none',
        }}
      />
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

        {/* Category Filter Pills in Header */}
        <div style={{ display: 'flex', gap: 4 }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                fontSize: '10px',
                padding: '3px 8px',
                borderRadius: 'var(--nova-radius-pill)',
                backgroundColor:
                  selectedCategory === cat.id ? 'rgba(102, 136, 255, 0.2)' : 'transparent',
                color:
                  selectedCategory === cat.id ? 'var(--nova-blue)' : 'var(--nova-text-muted)',
                fontWeight: selectedCategory === cat.id ? 600 : 400,
              }}
            >
              {cat.label}
            </button>
          ))}
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

      {/* Dynamic Module Nav Strip */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: '8px 16px',
          borderBottom: '1px solid var(--nova-border)',
          overflowX: 'auto',
        }}
      >
        {visibleModules.map((mod) => {
          const Icon = iconMap[mod.id] || LayoutGrid;
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 9px',
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
              <span>{mod.name}</span>
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
