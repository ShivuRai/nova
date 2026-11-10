import React, { useState, useEffect } from 'react';
import { Search, Pin, Copy, Trash2, Check, Sparkles, Link as LinkIcon, FileText } from 'lucide-react';
import { ClipboardItem } from '../../types';
import { useIslandStore } from '../../stores/useIslandStore';

export const ClipboardView: React.FC = () => {
  const { setInteracting } = useIslandStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'text' | 'link'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load real user clipboard history from persistent storage
  const [items, setItems] = useState<ClipboardItem[]>(() => {
    try {
      const saved = localStorage.getItem('nova_clipboard_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return [];
  });

  // Sync to localStorage
  const saveItems = (newItems: ClipboardItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem('nova_clipboard_history', JSON.stringify(newItems));
    } catch (e) {}
  };

  // Add a newly copied text snippet
  const addCopiedText = (text: string) => {
    if (!text || !text.trim()) return;
    const trimmed = text.trim();
    setItems((prev) => {
      // Don't duplicate if it's already the most recent item
      if (prev.length > 0 && prev[0].textContent === trimmed) {
        return prev;
      }
      const existingFiltered = prev.filter((it) => it.textContent !== trimmed);
      const isLink = trimmed.startsWith('http://') || trimmed.startsWith('https://');
      const newItem: ClipboardItem = {
        id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        contentType: isLink ? 'link' as any : 'text',
        textContent: trimmed,
        charCount: trimmed.length,
        isPinned: false,
        createdAt: Date.now(),
      };
      const updated = [newItem, ...existingFiltered].slice(0, 50); // Store up to 50 recent clips
      try {
        localStorage.setItem('nova_clipboard_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Listen for real-time clipboard events from Electron main process
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        const handleCopyDetected = (_event: any, data: any) => {
          if (data && data.textContent) {
            addCopiedText(data.textContent);
          }
        };

        ipcRenderer.on('clipboard-copy-detected', handleCopyDetected);

        // Fetch current clipboard text immediately on mount
        ipcRenderer.invoke('get-current-clipboard-text').then((text: string) => {
          if (text) addCopiedText(text);
        }).catch(() => {});

        return () => {
          ipcRenderer.removeListener('clipboard-copy-detected', handleCopyDetected);
        };
      } catch (e) {}
    } else {
      // Browser fallback: check navigator.clipboard
      navigator.clipboard?.readText?.().then((text) => {
        if (text) addCopiedText(text);
      }).catch(() => {});
    }
  }, []);

  const handleCopy = (item: ClipboardItem) => {
    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        ipcRenderer.invoke('write-clipboard-text', item.textContent);
      } catch (e) {
        navigator.clipboard?.writeText(item.textContent);
      }
    } else {
      navigator.clipboard?.writeText(item.textContent);
    }
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = items.map((it) => (it.id === id ? { ...it, isPinned: !it.isPinned } : it));
    saveItems(updated);
  };

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = items.filter((it) => it.id !== id);
    saveItems(updated);
  };

  const clearAll = () => {
    const updated = items.filter((it) => it.isPinned);
    saveItems(updated);
  };

  const filteredItems = items.filter((it) => {
    const matchesSearch = it.textContent.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    const isLink = it.textContent.startsWith('http://') || it.textContent.startsWith('https://');
    if (filterType === 'link') return isLink;
    if (filterType === 'text') return !isLink;
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
              outline: 'none',
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
                padding: '4px 8px',
                borderRadius: 'var(--nova-radius-pill)',
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'capitalize',
                backgroundColor: filterType === type ? 'var(--nova-blue)' : 'var(--nova-surface)',
                color: filterType === type ? '#fff' : 'var(--nova-text-secondary)',
                border: '1px solid var(--nova-border)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {items.length > 0 && (
          <button
            onClick={clearAll}
            title="Clear unpinned clips"
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--nova-radius-input)',
              backgroundColor: 'var(--nova-surface)',
              border: '1px solid var(--nova-border)',
              color: 'var(--nova-text-muted)',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Real-time Clipboard List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          maxHeight: 280,
          paddingRight: 4,
        }}
      >
        {filteredItems.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '36px 16px',
              color: 'var(--nova-text-muted)',
              textAlign: 'center',
            }}
          >
            <Sparkles size={28} style={{ color: 'var(--nova-blue)', opacity: 0.7 }} />
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
              {searchQuery ? 'No matching clips found' : 'Clipboard History is Clean'}
            </div>
            <div style={{ fontSize: '11px', maxWidth: 260, lineHeight: 1.4 }}>
              {searchQuery
                ? 'Try a different search term or clear the filter.'
                : 'Copy any text or link on your computer (Ctrl+C), and it will instantly appear here!'}
            </div>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isCopied = copiedId === item.id;
            const isLink = item.textContent.startsWith('http://') || item.textContent.startsWith('https://');

            return (
              <div
                key={item.id}
                onClick={() => handleCopy(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '8px 12px',
                  backgroundColor: isCopied ? 'rgba(56, 189, 248, 0.12)' : 'var(--nova-surface)',
                  border: isCopied ? '1px solid var(--nova-cyan)' : '1px solid var(--nova-border)',
                  borderRadius: 'var(--nova-radius-widget)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                  <div style={{ color: isLink ? 'var(--nova-cyan)' : 'var(--nova-text-muted)' }}>
                    {isLink ? <LinkIcon size={13} /> : <FileText size={13} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--nova-text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.textContent}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)', display: 'flex', gap: 6, marginTop: 2 }}>
                      <span>{item.charCount} chars</span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button
                    onClick={(e) => togglePin(item.id, e)}
                    title={item.isPinned ? 'Unpin' : 'Pin to top'}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 4,
                      color: item.isPinned ? 'var(--nova-blue)' : 'var(--nova-text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    <Pin size={13} style={{ transform: item.isPinned ? 'rotate(45deg)' : 'none' }} />
                  </button>

                  <button
                    onClick={(e) => deleteItem(item.id, e)}
                    title="Delete item"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 4,
                      color: 'var(--nova-text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '11px',
                      color: isCopied ? 'var(--nova-cyan)' : 'var(--nova-text-secondary)',
                      marginLeft: 4,
                    }}
                  >
                    {isCopied ? <Check size={13} style={{ color: 'var(--nova-cyan)' }} /> : <Copy size={13} />}
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
export default ClipboardView;
