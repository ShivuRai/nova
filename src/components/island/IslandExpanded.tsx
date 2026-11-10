import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  SlidersHorizontal,
  Cpu,
  TrendingUp,
  DollarSign,
  Smile,
  Sparkles,
  Palette,
  Settings,
  Pin,
  X,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import { playClickSound } from '../../services/soundService';

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

export const IslandExpandedContent: React.FC<IslandExpandedProps> = ({ onCollapse }) => {
  const { activeModule, setActiveModule, isPinned, setPinned } = useIslandStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const DEFAULT_CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'everyday', label: 'Everyday' },
    { id: 'files', label: 'Files' },
    { id: 'time', label: 'Time' },
    { id: 'desktop', label: 'Desktop' },
    { id: 'specialist', label: 'Specialist' },
  ];

  const [customCategories, setCustomCategories] = useState<Array<{ id: string; label: string }>>(() => {
    try {
      const stored = localStorage.getItem('nova_custom_categories_v2');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  });

  const [categoryModuleMap, setCategoryModuleMap] = useState<Record<string, string[]>>(() => {
    try {
      const stored = localStorage.getItem('nova_custom_category_modules_v2');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {};
  });

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isManagingModules, setIsManagingModules] = useState(false);

  const handleCreateCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setIsAddingCategory(false);
      return;
    }
    playClickSound();
    const newId = `custom_${Date.now()}`;
    const updatedCategories = [...customCategories, { id: newId, label: trimmed }];
    setCustomCategories(updatedCategories);
    try {
      localStorage.setItem('nova_custom_categories_v2', JSON.stringify(updatedCategories));
    } catch (e) {}

    // Pre-populate with current active module
    const updatedMap = { ...categoryModuleMap, [newId]: [activeModule] };
    setCategoryModuleMap(updatedMap);
    try {
      localStorage.setItem('nova_custom_category_modules_v2', JSON.stringify(updatedMap));
    } catch (e) {}

    setSelectedCategory(newId);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const handleDeleteCategory = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    const updatedCategories = customCategories.filter((c) => c.id !== catId);
    setCustomCategories(updatedCategories);
    try {
      localStorage.setItem('nova_custom_categories_v2', JSON.stringify(updatedCategories));
    } catch (e) {}

    const updatedMap = { ...categoryModuleMap };
    delete updatedMap[catId];
    setCategoryModuleMap(updatedMap);
    try {
      localStorage.setItem('nova_custom_category_modules_v2', JSON.stringify(updatedMap));
    } catch (e) {}

    if (selectedCategory === catId) {
      setSelectedCategory('all');
    }
  };

  const toggleModuleInCustomCategory = (moduleId: string) => {
    playClickSound();
    const currentList = categoryModuleMap[selectedCategory] || [];
    const exists = currentList.includes(moduleId);
    const updatedList = exists
      ? currentList.filter((id) => id !== moduleId)
      : [...currentList, moduleId];

    const updatedMap = { ...categoryModuleMap, [selectedCategory]: updatedList };
    setCategoryModuleMap(updatedMap);
    try {
      localStorage.setItem('nova_custom_category_modules_v2', JSON.stringify(updatedMap));
    } catch (e) {}
  };

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
    rgb: Palette,
    settings: Settings,
  };

  const categories = [...DEFAULT_CATEGORIES, ...customCategories];
  const isCustomCategory = selectedCategory.startsWith('custom_');

  const visibleModules = isCustomCategory
    ? MODULE_REGISTRY.filter((m) => (categoryModuleMap[selectedCategory] || []).includes(m.id))
    : MODULE_REGISTRY.filter(
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
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
      {/* Header Bar - Compact, sleek, zero wasted margin */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px 6px 14px',
          borderBottom: '1px solid var(--nova-border)',
        }}
      >
        {/* Brand & Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em' }}>
              NOVA
            </span>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>|</span>
          <span style={{ fontSize: '10px', color: 'var(--nova-text-secondary)', fontWeight: 500 }}>
            {dateString} • {timeString}
          </span>
        </div>

        {/* Pin & Close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => setPinned(!isPinned)}
            style={{
              padding: 5,
              borderRadius: 'var(--nova-radius-button)',
              color: isPinned ? 'var(--nova-blue)' : 'var(--nova-text-muted)',
              backgroundColor: isPinned ? 'rgba(102, 136, 255, 0.15)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title={isPinned ? 'Unpin Island' : 'Pin Island open'}
          >
            <Pin size={13} />
          </button>
          <button
            onClick={onCollapse}
            style={{
              padding: 5,
              borderRadius: 'var(--nova-radius-button)',
              color: 'var(--nova-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Collapse (Esc)"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Category Tabs - Left: Scrollable Category Pills; Right: Pinned Always-Visible Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px 6px 14px',
          borderBottom: '1px solid var(--nova-border)',
          gap: 6,
        }}
      >
        {/* Scrollable Category Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            flex: 1,
            minWidth: 0,
          }}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const isCustom = cat.id.startsWith('custom_');
            return (
              <motion.button
                key={cat.id}
                onClick={() => {
                  playClickSound();
                  setSelectedCategory(cat.id);
                  setIsManagingModules(false);
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  fontSize: '10.5px',
                  fontWeight: isSelected ? 600 : 500,
                  padding: '3px 9px',
                  borderRadius: 'var(--nova-radius-pill)',
                  color: isSelected ? 'var(--nova-text-primary)' : 'var(--nova-text-muted)',
                  position: 'relative',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  flexShrink: 0,
                }}
              >
                {isSelected && (
                  <motion.div
                    layoutId="active-category-pill"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 'var(--nova-radius-pill)',
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      border: '1px solid var(--nova-border)',
                      zIndex: -1,
                    }}
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  />
                )}
                <span>{cat.label}</span>
                {isCustom && (
                  <span
                    onClick={(e) => handleDeleteCategory(cat.id, e)}
                    title="Delete category"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 13,
                      height: 13,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'var(--nova-text-muted)',
                      marginLeft: 2,
                    }}
                  >
                    <X size={9} />
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Pinned Action Controls (+ Add Category and Manage Modules) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {isAddingCategory ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                type="text"
                autoFocus
                placeholder="Category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateCategory();
                  if (e.key === 'Escape') setIsAddingCategory(false);
                }}
                style={{
                  fontSize: '10px',
                  padding: '2px 7px',
                  borderRadius: 'var(--nova-radius-pill)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--nova-cyan)',
                  color: '#fff',
                  outline: 'none',
                  width: 90,
                }}
              />
              <button
                onClick={handleCreateCategory}
                style={{
                  background: 'var(--nova-cyan)',
                  color: '#000',
                  border: 'none',
                  borderRadius: 'var(--nova-radius-pill)',
                  padding: '2px 7px',
                  fontSize: '9.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName('');
                }}
                style={{
                  background: 'none',
                  color: 'var(--nova-text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 1,
                }}
              >
                <X size={11} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                playClickSound();
                setIsAddingCategory(true);
              }}
              title="Add custom category"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                fontSize: '10px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 'var(--nova-radius-pill)',
                color: 'var(--nova-cyan)',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Plus size={11} />
              <span>Category</span>
            </button>
          )}

          {/* Manage / Curate Apps Button */}
          <button
            onClick={() => {
              playClickSound();
              if (!isCustomCategory) {
                if (customCategories.length > 0) {
                  setSelectedCategory(customCategories[0].id);
                  setIsManagingModules(true);
                } else {
                  setIsAddingCategory(true);
                }
              } else {
                setIsManagingModules(!isManagingModules);
              }
            }}
            title={isManagingModules ? 'Done customizing' : 'Manage & curate apps in custom categories'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              fontSize: '10px',
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: 'var(--nova-radius-pill)',
              color: isManagingModules ? '#000' : 'var(--nova-text-secondary)',
              backgroundColor: isManagingModules ? 'var(--nova-cyan)' : 'rgba(255, 255, 255, 0.05)',
              border: isManagingModules ? '1px solid var(--nova-cyan)' : '1px solid var(--nova-border)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <SlidersHorizontal size={10} />
            <span>{isManagingModules ? 'Done' : 'Manage'}</span>
          </button>
        </div>
      </div>

      {/* Module Strip Bar - Interactive sliding selection with hover spring */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '6px 14px',
          borderBottom: '1px solid var(--nova-border)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {isCustomCategory && (
          <button
            onClick={() => {
              playClickSound();
              setIsManagingModules(!isManagingModules);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 8px',
              borderRadius: 'var(--nova-radius-pill)',
              fontSize: '10px',
              fontWeight: 600,
              backgroundColor: isManagingModules ? 'var(--nova-cyan)' : 'rgba(56, 189, 248, 0.12)',
              color: isManagingModules ? '#000' : 'var(--nova-cyan)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              marginRight: 4,
            }}
          >
            <Plus size={11} />
            <span>{isManagingModules ? 'Done Editing' : 'Edit Apps'}</span>
          </button>
        )}

        {visibleModules.length === 0 && !isManagingModules && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '10px', color: 'var(--nova-text-muted)', padding: '2px 4px' }}>
            <span>No apps in this category yet.</span>
            <button
              onClick={() => {
                playClickSound();
                setIsManagingModules(true);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--nova-blue)',
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline',
                fontSize: '10px',
              }}
            >
              Choose apps
            </button>
          </div>
        )}

        {visibleModules.map((mod) => {
          const Icon = iconMap[mod.id] || LayoutGrid;
          const isActive = activeModule === mod.id;
          return (
            <motion.button
              key={mod.id}
              onClick={() => {
                playClickSound();
                setActiveModule(mod.id);
              }}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 8px',
                borderRadius: 'var(--nova-radius-pill)',
                fontSize: '10.5px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--nova-blue)' : 'var(--nova-text-secondary)',
                position: 'relative',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="active-module-pill"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'var(--nova-radius-pill)',
                    backgroundColor: 'rgba(56, 189, 248, 0.16)',
                    border: '1px solid rgba(56, 189, 248, 0.40)',
                    zIndex: -1,
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <Icon size={12} />
              <span>{mod.name}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Module Manager Tray for Custom Categories */}
      {isCustomCategory && isManagingModules && (
        <div
          style={{
            padding: '6px 14px',
            backgroundColor: 'rgba(0,0,0,0.25)',
            borderBottom: '1px solid var(--nova-border)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            maxHeight: 70,
            overflowY: 'auto',
          }}
        >
          {MODULE_REGISTRY.map((m) => {
            const isIncluded = (categoryModuleMap[selectedCategory] || []).includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => toggleModuleInCustomCategory(m.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: '9.5px',
                  padding: '2px 6px',
                  borderRadius: 4,
                  backgroundColor: isIncluded ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.03)',
                  border: isIncluded ? '1px solid var(--nova-cyan)' : '1px solid var(--nova-border)',
                  color: isIncluded ? 'var(--nova-cyan)' : 'var(--nova-text-muted)',
                  cursor: 'pointer',
                }}
              >
                {isIncluded && <Check size={10} />}
                <span>{m.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main View Area - Fluid crossfade transition on module switch, zero wasted space */}
      <div style={{ padding: '10px 14px', overflowY: 'auto', flex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            style={{ height: '100%' }}
          >
            {renderModuleContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export const IslandExpanded: React.FC<IslandExpandedProps> = ({ onCollapse }) => {
  const { settings } = useThemeStore();
  const isRgb = settings.enableRgbBorder || settings.themeMode === 'rgb';

  return (
    <div
      style={{
        width: settings.expandedWidth,
        maxHeight: settings.expandedHeight,
        borderRadius: settings.notchStyle === 'notch-attached' ? '0 0 24px 24px' : 'var(--nova-radius-card)',
        backgroundColor: 'var(--nova-surface-glass)',
        boxShadow: 'var(--nova-shadow-card)',
        border: isRgb
          ? '1px solid rgba(96, 165, 250, 0.55)'
          : '1px solid var(--nova-border)',
        borderTop: settings.notchStyle === 'notch-attached' ? 'none' : undefined,
        backdropFilter: 'blur(30px) saturate(180%) contrast(105%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%) contrast(105%)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
      className={isRgb ? 'rgb-border' : ''}
    >
      <IslandExpandedContent onCollapse={onCollapse} />
    </div>
  );
};
