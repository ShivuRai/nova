import React, { useState } from 'react';
import { Search, Terminal, Globe, Folder, ArrowRight } from 'lucide-react';
import { useIslandStore } from '../../stores/useIslandStore';

export const LauncherView: React.FC = () => {
  const { setInteracting } = useIslandStore();
  const [query, setQuery] = useState('');

  const shortcuts = [
    { title: 'Google Chrome', subtitle: 'Application', icon: Globe },
    { title: 'Windows Terminal (PowerShell)', subtitle: 'Application', icon: Terminal },
    { title: 'Visual Studio Code', subtitle: 'Application', icon: Terminal },
    { title: 'Downloads Folder', subtitle: 'Directory', icon: Folder },
    { title: 'Documents Folder', subtitle: 'Directory', icon: Folder },
  ];

  const filtered = shortcuts.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Search Input Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          backgroundColor: 'var(--nova-surface)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-input)',
        }}
      >
        <Search size={16} style={{ color: 'var(--nova-blue)' }} />
        <input
          autoFocus
          type="text"
          placeholder="Search apps, bookmarks, files or run cmd..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setInteracting(true)}
          onBlur={() => setInteracting(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '13px',
            color: 'var(--nova-text-primary)',
            width: '100%',
          }}
        />
      </div>

      {/* Results List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflowY: 'auto' }}>
        {filtered.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: 'var(--nova-surface)',
                border: '1px solid var(--nova-border)',
                borderRadius: 'var(--nova-radius-widget)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    backgroundColor: 'rgba(102, 136, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--nova-blue)',
                  }}
                >
                  <Icon size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{item.title}</div>
                  <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>{item.subtitle}</div>
                </div>
              </div>

              <div style={{ color: 'var(--nova-text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '11px' }}>
                <span>Launch</span>
                <ArrowRight size={12} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
