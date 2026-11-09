import React, { useState } from 'react';
import { Search, Pin, Copy, Trash2, Check, Sparkles } from 'lucide-react';
import { ClipboardItem } from '../../types';
import { useIslandStore } from '../../stores/useIslandStore';

export const ClipboardView: React.FC = () => {
  const { setInteracting } = useIslandStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'text' | 'link'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initial mock / state items for active clipboard
  const [items, setItems] = useState<ClipboardItem[]>([
    {
      id: 'clip-1',
      contentType: 'text',
      textContent: 'https://github.com/nova-desktop/nova',
      sourceApp: 'Edge',
      charCount: 39,
      isPinned: true,
      createdAt: Date.now() - 1000 * 60 * 5,
    },
    {
      id: 'clip-2',
      contentType: 'text',
      textContent: 'cargo run --release --bin nova',
      sourceApp: 'Windows Terminal',
      charCount: 30,
      isPinned: false,
      createdAt: Date.now() - 1000 * 60 * 18,
    },
    {
      id: 'clip-3',
      contentType: 'text',
      textContent: 'const islandSpring = { stiffness: 420, damping: 32 };',
      sourceApp: 'VS Code',
      charCount: 52,
      isPinned: false,
      createdAt: Date.now() - 1000 * 60 * 45,
    },
    {
      id: 'clip-4',
      contentType: 'text',
      textContent: 'color: var(--nova-text-primary); font-family: Inter;',
      sourceApp: 'VS Code',
      charCount: 51,
      isPinned: false,
      createdAt: Date.now() - 1000 * 60 * 120,
    },
  ]);

  const handleCopy = (item: ClipboardItem) => {
    navigator.clipboard.writeText(item.textContent);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const togglePin = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, isPinned: !it.isPinned } : it))
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const clearAll = () => {
    setItems((prev) => prev.filter((it) => it.isPinned));
  };

  const filteredItems = items.filter((it) => {
    const matchesSearch = it.textContent.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'link') return it.textContent.startsWith('http');
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
      {/* Top Search & Filter Bar */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-input)',
            padding: '6px 10px',
          }}
        >
          <Search size={14} style={{ color: 'var(--nova-text-secondary)' }} />
          <input
            type="text"
            placeholder="Search clipboard history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setInteracting(true)}
            onBlur={() => setInteracting(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--nova-text-primary)',
              fontSize: '12px',
              width: '100%',
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['all', 'text', 'link'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                fontSize: '11px',
                padding: '5px 10px',
                borderRadius: 'var(--nova-radius-button)',
                backgroundColor:
                  filterType === type ? 'var(--nova-blue)' : 'var(--nova-surface)',
                color: filterType === type ? '#fff' : 'var(--nova-text-secondary)',
                border: '1px solid var(--nova-border)',
                textTransform: 'capitalize',
              }}
            >
              {type}
            </button>
          ))}
        </div>

        <button
          onClick={clearAll}
          title="Clear unpinned history"
          style={{
            padding: '6px 8px',
            borderRadius: 'var(--nova-radius-button)',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            color: 'var(--nova-text-muted)',
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Clipboard List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          maxHeight: 290,
          overflowY: 'auto',
          paddingRight: 4,
        }}
      >
        {filteredItems.length === 0 ? (
          <div
            style={{
              padding: '30px 0',
              textAlign: 'center',
              color: 'var(--nova-text-muted)',
              fontSize: '12px',
            }}
          >
            No clipboard snippets found.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: 'var(--nova-surface)',
                border: '1px solid var(--nova-border)',
                borderRadius: 'var(--nova-radius-widget)',
                fontSize: '12px',
                gap: 8,
              }}
            >
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div
                  style={{
                    fontFamily: item.textContent.includes(';') ? 'var(--font-mono)' : 'inherit',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: 'var(--nova-text-primary)',
                  }}
                >
                  {item.textContent}
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: 'var(--nova-text-muted)',
                    display: 'flex',
                    gap: 8,
                    marginTop: 2,
                  }}
                >
                  <span>{item.sourceApp || 'System'}</span>
                  <span>•</span>
                  <span>{item.charCount} chars</span>
                  {item.isPinned && (
                    <span style={{ color: 'var(--nova-warning)', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Sparkles size={10} /> Pinned
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={() => togglePin(item.id)}
                  style={{
                    padding: 5,
                    color: item.isPinned ? 'var(--nova-warning)' : 'var(--nova-text-muted)',
                  }}
                  title={item.isPinned ? 'Unpin' : 'Pin'}
                >
                  <Pin size={13} />
                </button>
                <button
                  onClick={() => handleCopy(item)}
                  style={{
                    padding: 5,
                    color: copiedId === item.id ? 'var(--nova-success)' : 'var(--nova-text-secondary)',
                  }}
                  title="Copy to clipboard"
                >
                  {copiedId === item.id ? <Check size={13} /> : <Copy size={13} />}
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  style={{
                    padding: 5,
                    color: 'var(--nova-text-muted)',
                  }}
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
