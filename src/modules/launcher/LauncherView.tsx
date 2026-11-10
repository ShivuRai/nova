import React, { useState, useEffect } from 'react';
import {
  Search,
  Terminal,
  Globe,
  Folder,
  ArrowRight,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Command,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useIslandStore } from '../../stores/useIslandStore';
import { runLaunchShortcut } from '../../services/platformService';

interface CustomShortcut {
  id: string;
  title: string;
  target: string;
  category: 'app' | 'web' | 'folder' | 'cmd';
  createdAt: number;
}

const STORAGE_KEY = 'nova_launcher_custom_shortcuts_v2';

const DEFAULT_STARTER_SHORTCUTS: CustomShortcut[] = [
  { id: 'sc-1', title: 'File Explorer', target: 'explorer.exe', category: 'app', createdAt: 1 },
  { id: 'sc-2', title: 'Windows Terminal', target: 'wt.exe', category: 'cmd', createdAt: 2 },
  { id: 'sc-3', title: 'Calculator', target: 'calc.exe', category: 'app', createdAt: 3 },
  { id: 'sc-4', title: 'Google Search', target: 'https://google.com', category: 'web', createdAt: 4 },
];

export const LauncherView: React.FC = () => {
  const { setInteracting } = useIslandStore();
  const [query, setQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formCategory, setFormCategory] = useState<'app' | 'web' | 'folder' | 'cmd'>('app');

  const [shortcuts, setShortcuts] = useState<CustomShortcut[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_STARTER_SHORTCUTS;
    } catch {
      return DEFAULT_STARTER_SHORTCUTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts));
    } catch (e) {
      console.error(e);
    }
  }, [shortcuts]);

  const handleLaunch = async (target: string, label: string) => {
    setFeedback(`Launching ${label}...`);
    try {
      await runLaunchShortcut(target);
    } catch (e) {
      console.warn('Launch error:', e);
    }
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleAddShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formTarget.trim()) return;

    let target = formTarget.trim();
    if (formCategory === 'web' && !/^https?:\/\//i.test(target)) {
      target = `https://${target}`;
    }

    const newShortcut: CustomShortcut = {
      id: 'sc-' + Date.now(),
      title: formTitle.trim(),
      target,
      category: formCategory,
      createdAt: Date.now(),
    };

    setShortcuts([newShortcut, ...shortcuts]);
    setFormTitle('');
    setFormTarget('');
    setIsAdding(false);
    setFeedback(`Added "${newShortcut.title}"`);
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShortcuts(shortcuts.filter((s) => s.id !== id));
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      // If matches a shortcut, launch it
      const matched = shortcuts.find(
        (s) => s.title.toLowerCase() === query.trim().toLowerCase()
      );
      if (matched) {
        handleLaunch(matched.target, matched.title);
      } else {
        // Direct launch query as URL or app
        handleLaunch(query.trim(), query.trim());
      }
    }
  };

  const filtered = shortcuts.filter(
    (s) =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.target.toLowerCase().includes(query.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'web':
        return Globe;
      case 'folder':
        return Folder;
      case 'cmd':
        return Terminal;
      default:
        return Command;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: 320 }}>
      {/* Header and Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Command size={13} style={{ color: 'var(--nova-cyan)' }} />
          <span>QUICK APP & SHORTCUT LAUNCHER</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {feedback && (
            <span style={{ fontSize: '10px', color: 'var(--nova-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={11} /> {feedback}
            </span>
          )}
          <button
            onClick={() => setIsAdding(!isAdding)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 8px',
              backgroundColor: isAdding ? 'rgba(239, 68, 68, 0.15)' : 'rgba(102, 136, 255, 0.15)',
              border: isAdding ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(102, 136, 255, 0.3)',
              borderRadius: 'var(--nova-radius-pill)',
              color: isAdding ? 'var(--nova-danger)' : 'var(--nova-blue)',
              fontSize: '10px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isAdding ? <X size={11} /> : <Plus size={11} />}
            <span>{isAdding ? 'Cancel' : '+ Add App'}</span>
          </button>
        </div>
      </div>

      {/* Add Shortcut Form Drawer */}
      {isAdding && (
        <form
          onSubmit={handleAddShortcut}
          style={{
            padding: '10px 12px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-blue)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input
              type="text"
              placeholder="App Name (e.g. Spotify, VS Code)"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              onFocus={() => setInteracting(true)}
              onBlur={() => setInteracting(false)}
              required
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--nova-border)',
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: '11px',
                color: 'var(--nova-text-primary)',
              }}
            />
            <input
              type="text"
              placeholder="Executable, path, or URL (e.g. notepad.exe)"
              value={formTarget}
              onChange={(e) => setFormTarget(e.target.value)}
              onFocus={() => setInteracting(true)}
              onBlur={() => setInteracting(false)}
              required
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--nova-border)',
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: '11px',
                color: 'var(--nova-text-primary)',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['app', 'cmd', 'web', 'folder'] as const).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setFormCategory(cat)}
                  style={{
                    padding: '2px 8px',
                    fontSize: '10px',
                    borderRadius: 4,
                    backgroundColor: formCategory === cat ? 'var(--nova-blue)' : 'rgba(255,255,255,0.04)',
                    color: formCategory === cat ? '#fff' : 'var(--nova-text-secondary)',
                    border: '1px solid var(--nova-border)',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              type="submit"
              style={{
                padding: '4px 12px',
                backgroundColor: 'var(--nova-blue)',
                border: 'none',
                borderRadius: 6,
                color: '#fff',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Save Shortcut
            </button>
          </div>
        </form>
      )}

      {/* Search Input Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          backgroundColor: 'var(--nova-surface)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-input)',
        }}
      >
        <Search size={14} style={{ color: 'var(--nova-blue)' }} />
        <input
          type="text"
          placeholder="Type to filter or press Enter to launch..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          onFocus={() => setInteracting(true)}
          onBlur={() => setInteracting(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '12px',
            color: 'var(--nova-text-primary)',
            width: '100%',
          }}
        />
      </div>

      {/* Results List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div
            style={{
              padding: 24,
              textAlign: 'center',
              color: 'var(--nova-text-muted)',
              fontSize: '11px',
              fontStyle: 'italic',
            }}
          >
            {query
              ? `No shortcuts matched "${query}". Press Enter to run directly as a command/URL!`
              : 'No shortcuts yet. Click "+ Add App" above to add your apps!'}
          </div>
        ) : (
          filtered.map((item) => {
            const Icon = getCategoryIcon(item.category);
            return (
              <div
                key={item.id}
                onClick={() => handleLaunch(item.target, item.title)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  backgroundColor: 'var(--nova-surface)',
                  border: '1px solid var(--nova-border)',
                  borderRadius: 'var(--nova-radius-widget)',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      backgroundColor: 'rgba(102, 136, 255, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--nova-blue)',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={13} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: '9px',
                        color: 'var(--nova-text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 260,
                      }}
                    >
                      {item.target}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    style={{
                      padding: 4,
                      color: 'var(--nova-text-muted)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: 4,
                    }}
                    title="Delete shortcut"
                  >
                    <Trash2 size={11} />
                  </button>
                  <div style={{ color: 'var(--nova-blue)', display: 'flex', alignItems: 'center', gap: 2, fontSize: '10px', fontWeight: 500 }}>
                    <span>Launch</span>
                    <ArrowRight size={11} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
