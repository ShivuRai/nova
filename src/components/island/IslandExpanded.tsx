import React, { useEffect, useRef, useState } from 'react';
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
  ChevronUp,
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
  const { activeModule, setActiveModule, isPinned, setPinned, setRetracted, setAiWhisperOpen } = useIslandStore();
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
    const trimmed = newCategoryName.trim().slice(0, 24);
    if (!trimmed) {
      setIsAddingCategory(false);
      return;
    }
    playClickSound();
    const newId = 'custom_' + crypto.randomUUID();
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

  const [now, setNow] = useState(() => new Date());
  const navigationRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 10000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    const strip = navigationRef.current;
    const selected = strip?.querySelector<HTMLElement>('[aria-current="page"]');
    if (strip && selected) {
      if (selected.offsetLeft < strip.scrollLeft) strip.scrollLeft = selected.offsetLeft;
      else if (selected.offsetLeft + selected.offsetWidth > strip.scrollLeft + strip.clientWidth) {
        strip.scrollLeft = selected.offsetLeft + selected.offsetWidth - strip.clientWidth + 10;
      }
    }
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeModule]);

  const selectCategory = (category: string) => {
    playClickSound();
    setSelectedCategory(category);
    setIsManagingModules(false);
  };
  const timeString = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dateString = now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
  const activeName = MODULE_REGISTRY.find((module) => module.id === activeModule)?.name || 'Home';

  return (
    <div className="nova-shell">
      <header className="nova-shell-header">
        <div className="nova-wordmark"><span><Sparkles size={16} /></span><strong>NOVA</strong></div>
        <time dateTime={now.toISOString()}>{dateString} · {timeString}</time>
        <div className="nova-header-actions">
          <button className="nova-icon-button" type="button" title="Quick Settings" aria-label="Quick Settings" onClick={() => { selectCategory('desktop'); setActiveModule('quick-settings'); }}><SlidersHorizontal size={16} /></button>
          <button className="nova-icon-button" type="button" title="Settings" aria-label="Settings" onClick={() => { selectCategory('desktop'); setActiveModule('settings'); }}><Settings size={16} /></button>
          <span className="nova-header-divider" />
          <button className="nova-icon-button" type="button" aria-pressed={isPinned} title="Pin island" aria-label="Pin island" onClick={() => setPinned(!isPinned)}><Pin size={15} /></button>
          <button className="nova-icon-button" type="button" title="Tuck into bezel" aria-label="Tuck into bezel" onClick={() => { onCollapse(); setRetracted(true); }}><ChevronUp size={16} /></button>
          <button className="nova-icon-button" type="button" title="Collapse island (Esc)" aria-label="Collapse island" onClick={onCollapse}><X size={16} /></button>
        </div>
      </header>

      <div className="nova-category-row">
        <nav className="nova-chips" aria-label="Tool categories">
          {categories.map((cat) => (
            <span className="nova-category" key={cat.id}>
              <button aria-pressed={selectedCategory === cat.id} onClick={() => selectCategory(cat.id)}>{cat.label}</button>
              {cat.id.startsWith('custom_') && selectedCategory === cat.id &&
                <button className="nova-icon-button" aria-label={'Delete ' + cat.label + ' category'} onClick={(event) => handleDeleteCategory(cat.id, event)}><X size={11} /></button>}
            </span>
          ))}
        </nav>
        <div className="nova-header-actions">
          {isCustomCategory && <button className="nova-icon-button" aria-label="Edit category tools" title="Edit category tools" aria-pressed={isManagingModules} onClick={() => setIsManagingModules(!isManagingModules)}><SlidersHorizontal size={15} /></button>}
          <button className="nova-icon-button" aria-label="New category" title="New category" onClick={() => setIsAddingCategory(!isAddingCategory)}><Plus size={16} /></button>
          <button className="nova-icon-button nova-find-tool" aria-label="Find a tool" title="Find a tool" onClick={() => setAiWhisperOpen(true)}><Search size={15} /></button>
        </div>
      </div>
      {isAddingCategory && <form className="nova-category-form" onSubmit={(event) => { event.preventDefault(); handleCreateCategory(); }}>
        <input aria-label="Category name" autoFocus maxLength={24} placeholder="Category name" value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} onKeyDown={(event) => {
          if (event.key === 'Escape') { event.preventDefault(); setIsAddingCategory(false); }
        }} />
        <button className="nova-action" type="submit">Add</button>
        <button className="nova-text-action" type="button" onClick={() => setIsAddingCategory(false)}>Cancel</button>
      </form>}
      <nav ref={navigationRef} className="nova-module-row" aria-label="Tools">
        {visibleModules.map((module) => {
          const Icon = iconMap[module.id] || LayoutGrid;
          return <button key={module.id} aria-current={activeModule === module.id ? 'page' : undefined} onClick={() => { playClickSound(); setActiveModule(module.id); }}><Icon size={14} /><span>{module.name}</span></button>;
        })}
        {visibleModules.length === 0 && <button onClick={() => setIsManagingModules(true)}>Choose tools</button>}
      </nav>
      {isCustomCategory && isManagingModules && <div className="nova-category-manager">
        {MODULE_REGISTRY.map((module) => {
          const included = (categoryModuleMap[selectedCategory] || []).includes(module.id);
          return <button aria-pressed={included} key={module.id} onClick={() => toggleModuleInCustomCategory(module.id)}>{included && <Check size={11} />}{module.name}</button>;
        })}
      </div>}
      <section className="nova-shell-content" ref={contentRef} aria-label={activeName}>
        <motion.div key={activeModule} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.13 }} style={{ minHeight: '100%' }}>
          {renderModuleContent()}
        </motion.div>
      </section>
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
